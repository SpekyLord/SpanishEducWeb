import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  duration: Number,
  thumbnailUrl: String,
  mimeType: String
}, { _id: false })

const authorSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  avatarUrl: String,
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  }
}, { _id: false })

const postSchema = new mongoose.Schema(
  {
    author: {
      type: authorSchema,
      required: true
    },
    
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
      trim: true
    },
    contentHtml: {
      type: String,
      maxlength: 20000
    },
    
    media: [mediaSchema],
    
    reactions: {
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      celebrate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      insightful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      question: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    
    reactionsCount: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      celebrate: { type: Number, default: 0 },
      insightful: { type: Number, default: 0 },
      question: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    
    commentsCount: { type: Number, default: 0 },
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarksCount: { type: Number, default: 0 },
    
    isPinned: { type: Boolean, default: false },
    pinnedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  { timestamps: true }
)

postSchema.index({ createdAt: -1 })
postSchema.index({ isPinned: -1, createdAt: -1 })
postSchema.index({ 'author._id': 1, createdAt: -1 })
postSchema.index({ isDeleted: 1, createdAt: -1 })
postSchema.index({ bookmarkedBy: 1 })
postSchema.index({ content: 'text' })

postSchema.virtual('hasMedia').get(function() {
  return this.media && this.media.length > 0
})

postSchema.methods.isBookmarkedByUser = function(userId) {
  return this.bookmarkedBy.some(id => id.toString() === userId.toString())
}

postSchema.methods.getUserReaction = function(userId) {
  if (!userId) return null
  
  const userIdStr = userId.toString()
  for (const [reactionType, userIds] of Object.entries(this.reactions)) {
    if (userIds.some(id => id.toString() === userIdStr)) {
      return reactionType
    }
  }
  return null
}

postSchema.statics.getPostsWithUserInfo = async function(query, userId, options = {}) {
  const { page = 1, limit = 10, sort = { isPinned: -1, createdAt: -1 } } = options

  const skip = (page - 1) * limit

  let postsQuery = this.find(query)

  // If sorting by textScore, add projection
  if (sort?.score?.$meta === 'textScore') {
    postsQuery = postsQuery.select({ score: { $meta: 'textScore' } })
  }

  const posts = await postsQuery
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()
  
  if (userId) {
    posts.forEach(post => {
      post.userReaction = this.prototype.getUserReaction.call(post, userId)
      post.isBookmarked = post.bookmarkedBy.some(id => id.toString() === userId.toString())
    })
  }
  
  const total = await this.countDocuments(query)
  
  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  }
}

const Post = mongoose.model('Post', postSchema)

export default Post
