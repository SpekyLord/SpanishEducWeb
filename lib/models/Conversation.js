import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    // Exactly 2 participants: teacher + student
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        unreadCount: { type: Number, default: 0 },
        lastReadAt: Date,
        _id: false
      }
    ],

    // Denormalized last message for conversation list
    lastMessage: {
      content: String,
      sender: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        displayName: String,
        avatarUrl: String,
        role: { type: String, enum: ['teacher', 'student'] }
      },
      hasImage: { type: Boolean, default: false },
      createdAt: Date,
      _id: false
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

// Indexes
conversationSchema.index({ 'participants.user': 1 })
conversationSchema.index({ updatedAt: -1 })
conversationSchema.index({ 'participants.user': 1, isDeleted: 1 })

// Helper method to get the other participant in the conversation
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.user.toString() !== userId.toString())
}

// Helper method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString())
  return participant?.unreadCount || 0
}

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation
