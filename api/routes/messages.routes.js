import { Router } from 'express'
import * as messagesController from '../controllers/messages.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// Get all conversations
router.get('/conversations', authenticate, messagesController.getConversations)

// Get or create conversation with a user
router.get('/conversation/:userId', authenticate, messagesController.getConversation)

// Get messages in a conversation
router.get('/conversation/:conversationId/messages', authenticate, messagesController.getMessages)

// Send message
router.post('/send', authenticate, messagesController.sendMessage)

// Mark messages as read
router.patch('/conversation/:conversationId/read', authenticate, messagesController.markAsRead)

// Delete message (sender only)
router.delete('/:id', authenticate, messagesController.deleteMessage)

export default router
