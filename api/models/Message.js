import mongoose from 'mongoose'

// Embedded sender schema (like Post.author pattern)
const senderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatarUrl: String,
  role: { type: String, enum: ['teacher', 'student'], required: true }
}, { _id: false })

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },

    // Embedded sender info for denormalized performance
    sender: {
      type: senderSchema,
      required: true
    },

    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },

    // Single image attachment (max 1 per message)
    image: {
      url: String,
      publicId: String,
      width: Number,
      height: Number
    },

    // Read receipts
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readAt: Date,

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  { timestamps: true }
)

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ conversation: 1, isDeleted: 1, createdAt: -1 })

// Virtual for isRead (backwards compatible)
messageSchema.virtual('isRead').get(function() {
  return this.readBy && this.readBy.length > 0
})

// Ensure virtuals are included when converting to JSON
messageSchema.set('toJSON', { virtuals: true })
messageSchema.set('toObject', { virtuals: true })

const Message = mongoose.model('Message', messageSchema)

export default Message
