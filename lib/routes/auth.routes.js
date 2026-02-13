import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refreshToken)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// Protected routes
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getCurrentUser)

export default router
