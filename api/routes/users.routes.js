import { Router } from 'express'
import multer from 'multer'
import * as usersController from '../controllers/users.controller.js'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import { requireTeacher } from '../middleware/role.middleware.js'

const router = Router()

// Configure multer for avatar uploads
const storage = multer.memoryStorage()
const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max (role-based check in controller)
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images allowed'))
    }
  }
})

// Search users (for @mention autocomplete)
router.get('/search', optionalAuth, usersController.searchUsers)

// Get user profile (public for teacher, authenticated for students)
router.get('/:username', optionalAuth, usersController.getUserProfile)

// Update own profile
router.put('/profile', authenticate, usersController.updateProfile)

// Upload avatar
router.post('/avatar', authenticate, avatarUpload.single('avatar'), usersController.uploadAvatar)

// Delete avatar
router.delete('/avatar', authenticate, usersController.deleteAvatar)

// Change password
router.patch('/password', authenticate, usersController.changePassword)

// Get user's bookmarks
router.get('/bookmarks', authenticate, usersController.getBookmarks)

// Deactivate account
router.patch('/deactivate', authenticate, usersController.deactivateAccount)

// Teacher-only: Get all students
router.get('/students', authenticate, requireTeacher, usersController.getAllStudents)

// Teacher-only: Get analytics
router.get('/analytics', authenticate, requireTeacher, usersController.getAnalytics)

export default router
