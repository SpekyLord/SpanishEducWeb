import mongoose from 'mongoose'

// Post model - To be fully implemented in Phase 2
const postSchema = new mongoose.Schema(
  {
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
      maxlength: 10000,
    },
    media: [
      {
        type: { type: String, enum: ['image', 'video', 'audio'] },
        url: String,
        publicId: String,
        width: Number,
        height: Number,
        duration: Number,
        thumbnailUrl: String,
      },
    ],
    reactions: {
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      celebrate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      insightful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      curious: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    reactionCounts: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      celebrate: { type: Number, default: 0 },
      insightful: { type: Number, default: 0 },
      curious: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    commentsCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    pinnedAt: Date,
  },
  { timestamps: true }
)

postSchema.index({ createdAt: -1 })
postSchema.index({ isPinned: 1, createdAt: -1 })

const Post = mongoose.model('Post', postSchema)

export default Post
