import { Router } from 'express'
import multer from 'multer'
import * as postsController from '../controllers/posts.controller.js'
import * as commentsController from '../controllers/comments.controller.js'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import { requireTeacher } from '../middleware/role.middleware.js'

const router = Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 6 // 5 images + 1 video
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
    
    if (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) {
      cb(null, true)
    } else if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`))
    }
  }
})

// Public routes (with optional auth for personalized data)
router.get('/', optionalAuth, postsController.getPosts)
router.get('/search', optionalAuth, postsController.searchPosts)
router.get('/:id', optionalAuth, postsController.getPost)
router.get('/:postId/comments', optionalAuth, commentsController.getComments)

// Protected routes
router.post('/', authenticate, requireTeacher, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]), postsController.createPost)
router.post('/:postId/comments', authenticate, commentsController.createComment)
router.put('/:id', authenticate, requireTeacher, postsController.updatePost)
router.delete('/:id', authenticate, requireTeacher, postsController.deletePost)
router.post('/:id/pin', authenticate, requireTeacher, postsController.pinPost)
router.delete('/:id/pin', authenticate, requireTeacher, postsController.unpinPost)

// Reactions
router.get('/:id/reactions', authenticate, postsController.getReactions)
router.post('/:id/reactions', authenticate, postsController.addReaction)
router.delete('/:id/reactions', authenticate, postsController.removeReaction)

// Bookmarks
router.post('/:id/bookmark', authenticate, postsController.bookmarkPost)
router.delete('/:id/bookmark', authenticate, postsController.removeBookmark)

export default router
