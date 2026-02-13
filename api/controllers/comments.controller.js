import Comment from '../models/Comment.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import { sanitizeString } from '../utils/validators.js'
import {
  createCommentReplyNotification,
  createCommentLikeNotification,
  createMentionNotification,
  createPinnedCommentNotification
} from '../services/notification.service.js'

const EDIT_WINDOW_MINUTES = 15
const MAX_COMMENT_DEPTH = 10

const createAuthorObject = (user) => ({
  _id: user._id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatar?.url || null,
  role: user.role
})

const extractMentions = (content) => {
  const matches = content.match(/@([a-zA-Z0-9_]+)/g) || []
  return matches.map((m) => m.slice(1))
}

const attachUserLike = (comment, userId) => {
  if (!userId) return comment
  const liked = comment.likes?.some((id) => id.toString() === userId.toString())
  return { ...comment, isLiked: liked }
}

export async function getComments(req, res) {
  try {
    const postId = req.params.postId || req.body.postId
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)
    const sort = req.query.sort || 'newest'

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { likesCount: -1, createdAt: -1 },
      discussed: { repliesCount: -1, createdAt: -1 }
    }

    if (!postId) {
      return res.status(400).json({ success: false, message: 'postId is required' })
    }

    const query = {
      post: postId,
      parentComment: null,
      isDeleted: false
    }

    const skip = (page - 1) * limit

    const [comments, total, pinnedComment] = await Promise.all([
      Comment.find(query)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query),
      Comment.findOne({ post: postId, isPinned: true, isDeleted: false }).lean()
    ])

    const commentIds = comments.map((c) => c._id)
    const replies = await Comment.find({
      post: postId,
      parentComment: { $in: commentIds },
      isDeleted: false
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()

    const repliesByParent = replies.reduce((acc, reply) => {
      const key = reply.parentComment.toString()
      if (!acc[key]) acc[key] = []
      acc[key].push(reply)
      return acc
    }, {})

    const userId = req.user?._id

    const commentsWithReplies = comments.map((comment) => {
      const childReplies = repliesByParent[comment._id.toString()] || []
      const limitedReplies = childReplies.slice(0, 3).map((r) => attachUserLike(r, userId))
      return attachUserLike({
        ...comment,
        replies: limitedReplies,
        hasMoreReplies: comment.repliesCount > limitedReplies.length
      }, userId)
    })

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pinnedComment: pinnedComment ? attachUserLike(pinnedComment, userId) : null
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching comments' })
  }
}

export async function getReplies(req, res) {
  try {
    const { postId: paramPostId, commentId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)
    const skip = (page - 1) * limit

    let postId = paramPostId
    if (!postId) {
      const parent = await Comment.findById(commentId).select('post')
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' })
      }
      postId = parent.post.toString()
    }

    const query = {
      post: postId,
      parentComment: commentId,
      isDeleted: false
    }

    const [replies, total] = await Promise.all([
      Comment.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
      Comment.countDocuments(query)
    ])

    const userId = req.user?._id
    const repliesWithLike = replies.map((r) => attachUserLike(r, userId))

    res.json({
      success: true,
      data: { replies: repliesWithLike },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })
  } catch (error) {
    console.error('Get replies error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching replies' })
  }
}

export async function getComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id).lean()
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    const includeContext = req.query.context !== 'false'
    let parentChain = []

    if (includeContext && comment.path) {
      const ids = comment.path.split('/').filter(Boolean)
      const parentIds = ids.filter((id) => id !== comment._id.toString())
      if (parentIds.length > 0) {
        const parents = await Comment.find({ _id: { $in: parentIds } }).lean()
        const byId = parents.reduce((acc, item) => {
          acc[item._id.toString()] = item
          return acc
        }, {})
        parentChain = parentIds.map((id) => byId[id]).filter(Boolean)
      }
    }

    res.json({
      success: true,
      data: {
        comment: attachUserLike(comment, req.user?._id),
        parentChain
      }
    })
  } catch (error) {
    console.error('Get comment error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching comment' })
  }
}

export async function createComment(req, res) {
  try {
    const postId = req.body.postId || req.params.postId
    const { content } = req.body
    const parentComment = req.body.parentComment || req.body.parentCommentId

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' })
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = sanitizeString(content.trim())

    if (sanitizedContent.length > 2000) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 2000 characters' })
    }

    if (!postId) {
      return res.status(400).json({ success: false, message: 'postId is required' })
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false })
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    let parent = null
    let rootComment = null
    let depth = 0
    let path = ''

    if (parentComment) {
      parent = await Comment.findById(parentComment)
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' })
      }
      if (parent.post.toString() !== postId) {
        return res.status(400).json({ success: false, message: 'Parent comment does not belong to this post' })
      }

      depth = parent.depth + 1

      // Prevent excessive nesting
      if (depth > MAX_COMMENT_DEPTH) {
        return res.status(400).json({
          success: false,
          message: `Maximum comment nesting depth of ${MAX_COMMENT_DEPTH} exceeded`
        })
      }

      rootComment = parent.rootComment || parent._id
      path = parent.path || parent._id.toString()
    }

    // Extract mentions from sanitized content
    const mentions = extractMentions(sanitizedContent)

    const comment = await Comment.create({
      post: postId,
      author: createAuthorObject(req.user),
      content: sanitizedContent,
      mentions,
      parentComment: parent ? parent._id : null,
      rootComment: rootComment || null,
      path,
      depth
    })

    comment.path = path ? `${path}/${comment._id}` : comment._id.toString()
    await comment.save()

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.commentsCount': 1 } })

    if (parent) {
      await Comment.findByIdAndUpdate(parent._id, { $inc: { repliesCount: 1, totalRepliesCount: 1 } })
      if (rootComment && rootComment.toString() !== parent._id.toString()) {
        await Comment.findByIdAndUpdate(rootComment, { $inc: { totalRepliesCount: 1 } })
      }

      // Create notification for comment reply
      try {
        await createCommentReplyNotification(comment, parent, post)
      } catch (notifError) {
        console.error('Failed to create reply notification:', notifError)
      }
    }

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      try {
        const mentionedUsers = await User.find({
          username: { $in: mentions },
          _id: { $ne: req.user._id } // Don't notify self
        }).select('_id')

        for (const mentionedUser of mentionedUsers) {
          await createMentionNotification(mentionedUser._id, comment, post)
        }
      } catch (notifError) {
        console.error('Failed to create mention notifications:', notifError)
      }
    }

    res.status(201).json({ success: true, data: { comment } })
  } catch (error) {
    console.error('Create comment error:', error)
    res.status(500).json({ success: false, message: 'Server error creating comment' })
  }
}

export async function updateComment(req, res) {
  try {
    const { content } = req.body
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty' })
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = sanitizeString(content.trim())

    if (sanitizedContent.length > 2000) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 2000 characters' })
    }

    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }
    if (comment.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted comment' })
    }

    if (comment.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this comment' })
    }

    if (req.user.role === 'student') {
      const diffMinutes = (Date.now() - comment.createdAt.getTime()) / (1000 * 60)
      if (diffMinutes > EDIT_WINDOW_MINUTES) {
        return res.status(403).json({ success: false, message: 'Edit window expired (15 minutes)' })
      }
    }

    comment.content = sanitizedContent
    comment.mentions = extractMentions(sanitizedContent)
    comment.isEdited = true
    comment.editedAt = new Date()
    await comment.save()

    res.json({ success: true, data: { comment } })
  } catch (error) {
    console.error('Update comment error:', error)
    res.status(500).json({ success: false, message: 'Server error updating comment' })
  }
}

export async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    if (comment.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' })
    }

    if (!comment.isDeleted) {
      comment.isDeleted = true
      comment.deletedAt = new Date()
      await comment.save()
    }

    res.json({ success: true, message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting comment' })
  }
}

export async function likeComment(req, res) {
  try {
    const userId = req.user._id
    const commentId = req.params.id

    // Atomic: only add like if not already present
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, isDeleted: false, likes: { $ne: userId } },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
      },
      { new: true }
    )

    if (!comment) {
      // Either not found or already liked
      const exists = await Comment.findOne({ _id: commentId, isDeleted: false })
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Comment not found' })
      }
      return res.json({ success: true, data: { likesCount: exists.likesCount } })
    }

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.likesGiven': 1 } })

    // Create notification for comment like
    try {
      await createCommentLikeNotification(comment, req.user)
    } catch (notifError) {
      console.error('Failed to create like notification:', notifError)
    }

    res.json({ success: true, data: { likesCount: comment.likesCount } })
  } catch (error) {
    console.error('Like comment error:', error)
    res.status(500).json({ success: false, message: 'Server error liking comment' })
  }
}

export async function unlikeComment(req, res) {
  try {
    const userId = req.user._id
    const commentId = req.params.id

    // Atomic: remove like only if present
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, isDeleted: false, likes: userId },
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 }
      },
      { new: true }
    )

    if (!comment) {
      const exists = await Comment.findOne({ _id: commentId, isDeleted: false })
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Comment not found' })
      }
      return res.json({ success: true, data: { likesCount: exists.likesCount } })
    }

    res.json({ success: true, data: { likesCount: Math.max(0, comment.likesCount) } })
  } catch (error) {
    console.error('Unlike comment error:', error)
    res.status(500).json({ success: false, message: 'Server error unliking comment' })
  }
}

export async function pinComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    // Get the post to verify authorization
    const post = await Post.findById(comment.post)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    // AUTHORIZATION: Only post author can pin comments
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only post author can pin comments'
      })
    }

    await Comment.updateMany({ post: comment.post }, { $set: { isPinned: false } })
    comment.isPinned = true
    await comment.save()

    // Create notification for pinned comment
    try {
      await createPinnedCommentNotification(comment, comment.post, req.user)
    } catch (notifError) {
      console.error('Failed to create pinned notification:', notifError)
    }

    res.json({ success: true, data: { comment } })
  } catch (error) {
    console.error('Pin comment error:', error)
    res.status(500).json({ success: false, message: 'Server error pinning comment' })
  }
}

export async function unpinComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    // Get the post to verify authorization
    const post = await Post.findById(comment.post)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    // AUTHORIZATION: Only post author can unpin comments
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only post author can unpin comments'
      })
    }

    comment.isPinned = false
    await comment.save()

    res.json({ success: true, data: { comment } })
  } catch (error) {
    console.error('Unpin comment error:', error)
    res.status(500).json({ success: false, message: 'Server error unpinning comment' })
  }
}
