import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';
import { uploadImage, deleteFile, UPLOAD_LIMITS } from '../services/cloudinary.service.js';

// Cascade denormalized user data updates across all collections
async function cascadeUserUpdates(userId, updates) {
  const ops = []

  if (updates.avatarUrl !== undefined) {
    ops.push(
      Post.updateMany({ 'author._id': userId }, { $set: { 'author.avatarUrl': updates.avatarUrl } }),
      Comment.updateMany({ 'author._id': userId }, { $set: { 'author.avatarUrl': updates.avatarUrl } }),
      Message.updateMany({ 'sender._id': userId }, { $set: { 'sender.avatarUrl': updates.avatarUrl } }),
      Conversation.updateMany({ 'lastMessage.sender._id': userId }, { $set: { 'lastMessage.sender.avatarUrl': updates.avatarUrl } }),
      Notification.updateMany({ 'actor._id': userId }, { $set: { 'actor.avatar': updates.avatarUrl } })
    )
  }

  if (updates.displayName !== undefined) {
    ops.push(
      Post.updateMany({ 'author._id': userId }, { $set: { 'author.displayName': updates.displayName } }),
      Comment.updateMany({ 'author._id': userId }, { $set: { 'author.displayName': updates.displayName } }),
      Message.updateMany({ 'sender._id': userId }, { $set: { 'sender.displayName': updates.displayName } }),
      Conversation.updateMany({ 'lastMessage.sender._id': userId }, { $set: { 'lastMessage.sender.displayName': updates.displayName } }),
      Notification.updateMany({ 'actor._id': userId }, { $set: { 'actor.displayName': updates.displayName } })
    )
  }

  if (ops.length > 0) {
    await Promise.allSettled(ops)
  }
}

export async function searchUsers(req, res) {
  try {
    let { q, limit = 5 } = req.query;

    // Validate query parameter type and presence
    if (!q || typeof q !== 'string' || q.length < 1) {
      return res.json({ success: true, users: [] });
    }

    // Escape special regex characters to prevent NoSQL injection
    const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Prevent ReDoS attacks with length limit
    if (escapedQ.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Search query too long (max 50 characters)'
      });
    }

    // Enforce maximum limit to prevent resource exhaustion
    const safeLimit = Math.min(parseInt(limit) || 5, 20);

    const users = await User.find({
      $or: [
        { username: { $regex: escapedQ, $options: 'i' } },
        { displayName: { $regex: escapedQ, $options: 'i' } }
      ]
    })
    .select('username displayName avatar.url')
    .limit(safeLimit)
    .lean();

    res.json({
      success: true,
      users: users.map(u => ({
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatar?.url
      }))
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
}

export async function getUserProfile(req, res) {
  try {
    const { username } = req.params

    const user = await User.findOne({ username, isActive: true })
      .select('displayName username role avatar bio stats createdAt')
      .lean()

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let recentPosts = []
    if (user.role === 'teacher') {
      recentPosts = await Post.find({
        'author._id': user._id,
        isDeleted: { $ne: true }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('content media createdAt isPinned reactionsCount commentsCount')
        .lean()
    }

    res.json({
      success: true,
      data: {
        user,
        recentPosts
      }
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load user profile'
    })
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user._id
    const { displayName, bio } = req.body

    const updates = {}

    if (displayName !== undefined) {
      const trimmed = displayName.trim()
      if (trimmed.length < 2 || trimmed.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Display name must be between 2 and 50 characters'
        })
      }
      updates.displayName = trimmed
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio must be 500 characters or less'
        })
      }
      updates.bio = bio.trim()
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('displayName username role avatar bio stats createdAt')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Cascade displayName update to all denormalized collections
    if (updates.displayName) {
      cascadeUserUpdates(userId, { displayName: updates.displayName })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }

    // Role-based size limit
    const maxSize = req.user.role === 'teacher' ? 5 * 1024 * 1024 : 2 * 1024 * 1024
    if (req.file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024)
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${limitMB}MB`
      })
    }

    // Upload to Cloudinary
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const result = await uploadImage(dataUri, {
      folder: UPLOAD_LIMITS.avatar.folder,
      transformation: UPLOAD_LIMITS.avatar.transformation
    })

    // Delete old avatar if exists
    const currentUser = await User.findById(req.user._id)
    if (currentUser.avatar?.publicId) {
      try { await deleteFile(currentUser.avatar.publicId) } catch (e) { /* ignore cleanup errors */ }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'avatar.url': result.url, 'avatar.publicId': result.publicId } },
      { new: true }
    ).select('displayName username role avatar bio stats createdAt')

    // Cascade avatar update to all denormalized collections
    cascadeUserUpdates(req.user._id, { avatarUrl: result.url })

    res.json({ success: true, data: { user } })
  } catch (error) {
    console.error('Upload avatar error:', error)
    res.status(500).json({ success: false, message: 'Failed to upload avatar' })
  }
}

export async function deleteAvatar(req, res) {
  try {
    const currentUser = await User.findById(req.user._id)

    if (currentUser.avatar?.publicId) {
      try { await deleteFile(currentUser.avatar.publicId) } catch (e) { /* ignore cleanup errors */ }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'avatar.url': null, 'avatar.publicId': null } },
      { new: true }
    ).select('displayName username role avatar bio stats createdAt')

    // Cascade avatar removal to all denormalized collections
    cascadeUserUpdates(req.user._id, { avatarUrl: null })

    res.json({ success: true, data: { user } })
  } catch (error) {
    console.error('Delete avatar error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete avatar' })
  }
}

export async function changePassword(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function getBookmarks(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function deactivateAccount(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function getAllStudents(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function getAnalytics(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}
