import { Router } from 'express'
import * as postsController from '../controllers/posts.controller.js'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import { requireTeacher } from '../middleware/role.middleware.js'

const router = Router()

// Public routes (with optional auth for personalized data)
router.get('/', optionalAuth, postsController.getPosts)
router.get('/:id', optionalAuth, postsController.getPost)

// Protected routes
router.post('/', authenticate, requireTeacher, postsController.createPost)
router.put('/:id', authenticate, requireTeacher, postsController.updatePost)
router.delete('/:id', authenticate, requireTeacher, postsController.deletePost)
router.post('/:id/pin', authenticate, requireTeacher, postsController.pinPost)
router.delete('/:id/pin', authenticate, requireTeacher, postsController.unpinPost)

// Reactions
router.post('/:id/reactions', authenticate, postsController.addReaction)
router.delete('/:id/reactions', authenticate, postsController.removeReaction)

// Bookmarks
router.post('/:id/bookmark', authenticate, postsController.bookmarkPost)
router.delete('/:id/bookmark', authenticate, postsController.removeBookmark)

export default router
