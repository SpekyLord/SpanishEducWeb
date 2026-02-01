import { Router } from 'express'
import * as usersController from '../controllers/users.controller.js'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import { requireTeacher } from '../middleware/role.middleware.js'

const router = Router()

// Get user profile (public for teacher, authenticated for students)
router.get('/:username', optionalAuth, usersController.getUserProfile)

// Update own profile
router.put('/profile', authenticate, usersController.updateProfile)

// Upload avatar
router.post('/avatar', authenticate, usersController.uploadAvatar)

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
