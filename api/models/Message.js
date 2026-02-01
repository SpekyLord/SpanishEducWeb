import mongoose from 'mongoose'

// Message model - To be fully implemented in Phase 4
const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [
      {
        type: { type: String, enum: ['image'] },
        url: String,
        publicId: String,
      },
    ],
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

messageSchema.index({ conversation: 1, createdAt: -1 })

const Message = mongoose.model('Message', messageSchema)

export default Message
