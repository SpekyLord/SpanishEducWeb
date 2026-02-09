import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { v2 as cloudinary } from 'cloudinary'
import { sanitizeString } from '../utils/validators.js'
import { createDirectMessageNotification } from '../services/notification.service.js'

// Helper: Create sender object (like Post.author pattern)
const createSenderObject = (user) => ({
  _id: user._id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatar?.url || null,
  role: user.role
})

// Helper: Upload image to Cloudinary
const uploadMessageImage = async (file) => {
  const options = {
    folder: 'spanishconnect/messages',
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }

  const uploadSource = file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(uploadSource, options)

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height
  }
}

// Send Message
export async function sendMessage(req, res) {
  try {
    const { recipientId, content } = req.body
    const sender = req.user

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      })
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = sanitizeString(content.trim())

    if (sanitizedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters'
      })
    }

    // Get recipient
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      })
    }

    // Authorization: Students can ONLY message teacher
    if (sender.role === 'student' && recipient.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Students can only message the teacher'
      })
    }

    // Handle image upload
    let image = null
    if (req.file) {
      // Validate file size
      const maxSize = sender.role === 'teacher' ? 5 * 1024 * 1024 : 2 * 1024 * 1024
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Image must be less than ${sender.role === 'teacher' ? '5MB' : '2MB'}`
        })
      }

      try {
        image = await uploadMessageImage(req.file)
      } catch (error) {
        console.error('Image upload error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        })
      }
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      'participants.user': { $all: [sender._id, recipient._id] },
      isDeleted: false
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: sender._id, unreadCount: 0 },
          { user: recipient._id, unreadCount: 0 }
        ]
      })
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: createSenderObject(sender),
      content: sanitizedContent,
      image
    })

    // Update conversation
    const recipientParticipant = conversation.participants.find(
      p => p.user.toString() === recipient._id.toString()
    )
    recipientParticipant.unreadCount += 1

    conversation.lastMessage = {
      content: sanitizedContent.substring(0, 100),
      sender: createSenderObject(sender),
      hasImage: !!image,
      createdAt: message.createdAt
    }

    await conversation.save()

    // Create notification
    await createDirectMessageNotification(message, conversation, recipient)

    res.status(201).json({
      success: true,
      data: { message, conversation }
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    })
  }
}

// Get Conversations
export async function getConversations(req, res) {
  try {
    const userId = req.user._id

    // Find all conversations for this user
    const conversations = await Conversation.find({
      'participants.user': userId,
      isDeleted: false
    })
      .sort({ updatedAt: -1 })
      .lean()

    // Populate other participant info
    const conversationsWithInfo = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          p => p.user.toString() !== userId.toString()
        )
        const participant = conv.participants.find(
          p => p.user.toString() === userId.toString()
        )

        const otherUser = await User.findById(otherParticipant.user).lean()

        return {
          ...conv,
          otherUser: {
            _id: otherUser._id,
            username: otherUser.username,
            displayName: otherUser.displayName,
            avatarUrl: otherUser.avatar?.url || null,
            role: otherUser.role
          },
          unreadCount: participant.unreadCount
        }
      })
    )

    res.json({
      success: true,
      data: { conversations: conversationsWithInfo }
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversations'
    })
  }
}

// Get Messages
export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 30, 50)
    const skip = (page - 1) * limit

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': req.user._id,
      isDeleted: false
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }

    // Get messages with pagination (newest first, reversed for display)
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false
    })

    // Add isRead flag for current user
    messages.forEach(msg => {
      msg.isRead = msg.readBy && msg.readBy.some(id => id.toString() === req.user._id.toString())
    })

    res.json({
      success: true,
      data: { messages: messages.reverse() }, // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    })
  }
}

// Get Conversation (or create new one)
export async function getConversation(req, res) {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id

    // Find conversation between these users
    let conversation = await Conversation.findOne({
      'participants.user': { $all: [currentUserId, userId] },
      isDeleted: false
    })

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [
          { user: currentUserId, unreadCount: 0 },
          { user: userId, unreadCount: 0 }
        ]
      })
    }

    res.json({
      success: true,
      data: { conversation }
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversation'
    })
  }
}

// Mark as Read
export async function markAsRead(req, res) {
  try {
    const { conversationId } = req.params
    const userId = req.user._id

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId,
      isDeleted: false
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        'sender._id': { $ne: userId }, // Not sent by current user
        readBy: { $ne: userId }, // Not already read
        isDeleted: false
      },
      {
        $addToSet: { readBy: userId },
        $set: { readAt: new Date() }
      }
    )

    // Reset unread count for this user
    const participant = conversation.participants.find(
      p => p.user.toString() === userId.toString()
    )
    participant.unreadCount = 0
    participant.lastReadAt = new Date()
    await conversation.save()

    res.json({
      success: true,
      data: { markedRead: result.modifiedCount }
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read'
    })
  }
}

// Delete Message (soft delete)
export async function deleteMessage(req, res) {
  try {
    const { id } = req.params
    const userId = req.user._id

    const message = await Message.findOne({ _id: id, isDeleted: false })

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Only sender can delete
    if (message.sender._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      })
    }

    message.isDeleted = true
    message.deletedAt = new Date()
    await message.save()

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    })
  }
}
