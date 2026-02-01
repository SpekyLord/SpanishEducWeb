import mongoose from 'mongoose'

const authorSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatarUrl: String,
    role: { type: String, enum: ['teacher', 'student'], required: true }
  },
  { _id: false }
)

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: authorSchema, required: true },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },
    mentions: [{ type: String }],
    // Threading
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    rootComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    path: { type: String, default: '', index: true },
    depth: { type: Number, default: 0, index: true },
    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0, index: true },
    repliesCount: { type: Number, default: 0 },
    totalRepliesCount: { type: Number, default: 0 },
    // Status
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    editedAt: Date
  },
  { timestamps: true }
)

// Indexes for efficient comment queries
commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 })
commentSchema.index({ post: 1, rootComment: 1, path: 1 })
commentSchema.index({ post: 1, isPinned: 1, createdAt: -1 })

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
