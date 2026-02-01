import mongoose from 'mongoose'

// Comment model - To be fully implemented in Phase 3
const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: String,
      displayName: String,
      avatar: String,
      role: String,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    // Threading
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    rootComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    path: { type: String, default: '' }, // Materialized path for efficient queries
    depth: { type: Number, default: 0 },
    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    // Status
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    editedAt: Date,
  },
  { timestamps: true }
)

// Indexes for efficient comment queries
commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 })
commentSchema.index({ post: 1, rootComment: 1, path: 1 })
commentSchema.index({ post: 1, isPinned: 1 })

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
