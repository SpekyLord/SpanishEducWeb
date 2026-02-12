import User from '../models/User.js';
import Post from '../models/Post.js';

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
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function deleteAvatar(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
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
