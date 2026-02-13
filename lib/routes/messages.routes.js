import { Router } from 'express'
import multer from 'multer'
import * as messagesController from '../controllers/messages.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// Configure multer for image uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max (teacher limit)
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

// Get all conversations
router.get('/conversations', authenticate, messagesController.getConversations)

// Get or create conversation with a user
router.get('/conversation/:userId', authenticate, messagesController.getConversation)

// Get messages in a conversation
router.get('/conversation/:conversationId/messages', authenticate, messagesController.getMessages)

// Send message with optional image
router.post('/send', authenticate, upload.single('image'), messagesController.sendMessage)

// Mark messages as read
router.patch('/conversation/:conversationId/read', authenticate, messagesController.markAsRead)

// Delete message (sender only)
router.delete('/:id', authenticate, messagesController.deleteMessage)

export default router
