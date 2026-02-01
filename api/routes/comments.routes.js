import { Router } from 'express'
import * as commentsController from '../controllers/comments.controller.js'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import { requireTeacher } from '../middleware/role.middleware.js'

const router = Router()

// Get comments for a post
router.get('/post/:postId', optionalAuth, commentsController.getComments)
router.get('/post/:postId/replies/:commentId', optionalAuth, commentsController.getReplies)

// Get single comment
router.get('/:id', optionalAuth, commentsController.getComment)

// Create comment
router.post('/', authenticate, commentsController.createComment)

// Update comment (owner only, 15-minute window for students)
router.put('/:id', authenticate, commentsController.updateComment)

// Delete comment
router.delete('/:id', authenticate, commentsController.deleteComment)

// Like/unlike comment
router.post('/:id/like', authenticate, commentsController.likeComment)
router.delete('/:id/like', authenticate, commentsController.unlikeComment)

// Pin comment (teacher only)
router.post('/:id/pin', authenticate, requireTeacher, commentsController.pinComment)
router.delete('/:id/pin', authenticate, requireTeacher, commentsController.unpinComment)

export default router
