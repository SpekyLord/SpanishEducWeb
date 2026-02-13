import { Router } from 'express'
import * as filesController from '../controllers/files.controller.js'
import { upload } from '../controllers/files.controller.js'
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js'
import { requireTeacher } from '../middleware/role.middleware.js'

const router = Router()

// Browse files and folders
router.get('/', optionalAuth, filesController.getFiles)
router.get('/folder/:folderId', optionalAuth, filesController.getFilesInFolder)

// Download file (authenticated users only)
router.get('/:id/download', authenticate, filesController.downloadFile)

// Upload file (teacher only)
router.post('/upload', authenticate, requireTeacher, upload.single('file'), filesController.uploadFile)

// Create folder (teacher only)
router.post('/folder', authenticate, requireTeacher, filesController.createFolder)

// Update file/folder (teacher only)
router.put('/:id', authenticate, requireTeacher, filesController.updateFile)

// Delete file/folder (teacher only)
router.delete('/:id', authenticate, requireTeacher, filesController.deleteFile)

// Move file to different folder (teacher only)
router.patch('/:id/move', authenticate, requireTeacher, filesController.moveFile)

export default router
