import mongoose from 'mongoose'

// Conversation model - To be fully implemented in Phase 4
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        unreadCount: { type: Number, default: 0 },
        lastReadAt: Date,
      },
    ],
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: Date,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

conversationSchema.index({ 'participants.user': 1 })
conversationSchema.index({ updatedAt: -1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation
