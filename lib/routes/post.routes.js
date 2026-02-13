import express from 'express';
import multer from 'multer';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleReaction,
  toggleBookmark
} from '../controllers/post.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 6 // 5 images + 1 video
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    
    if (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`));
    }
  }
});

// Get posts (with optional auth for user-specific data)
router.get('/', optionalAuth, getPosts);

// Get single post
router.get('/:postId', optionalAuth, getPost);

// Create post (teacher only)
router.post('/', authenticate, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]), createPost);

// Update post (teacher only)
router.put('/:postId', authenticate, updatePost);

// Delete post (teacher only)
router.delete('/:postId', authenticate, deletePost);

// Toggle reaction
router.post('/:postId/reactions', authenticate, toggleReaction);

// Toggle bookmark
router.post('/:postId/bookmark', authenticate, toggleBookmark);

export default router;
