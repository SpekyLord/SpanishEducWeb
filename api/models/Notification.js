import mongoose from 'mongoose'

// Notification model - To be fully implemented in Phase 5
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'comment_reply',
        'comment_like',
        'mention',
        'new_post',
        'pinned_comment',
        'direct_message',
      ],
      required: true,
    },
    // Actor who triggered the notification
    actor: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      displayName: String,
      avatar: String,
    },
    // Reference to the relevant content
    reference: {
      type: { type: String, enum: ['post', 'comment', 'message'] },
      id: mongoose.Schema.Types.ObjectId,
      postId: mongoose.Schema.Types.ObjectId, // For comment notifications
    },
    content: String, // Preview text
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })

// Auto-delete notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
