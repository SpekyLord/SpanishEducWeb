import { Router } from 'express'
import * as notificationsController from '../controllers/notifications.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// Get notifications
router.get('/', authenticate, notificationsController.getNotifications)

// Get unread count
router.get('/unread-count', authenticate, notificationsController.getUnreadCount)

// Mark single notification as read
router.patch('/:id/read', authenticate, notificationsController.markAsRead)

// Mark all notifications as read
router.patch('/read-all', authenticate, notificationsController.markAllAsRead)

// Delete notification
router.delete('/:id', authenticate, notificationsController.deleteNotification)

export default router
