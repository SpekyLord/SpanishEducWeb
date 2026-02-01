import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import connectDB from './utils/db.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import postsRoutes from './routes/posts.routes.js'
import commentsRoutes from './routes/comments.routes.js'
import filesRoutes from './routes/files.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import usersRoutes from './routes/users.routes.js'

dotenv.config()

const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Connect to database
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/files', filesRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/users', usersRoutes)

// 404 handler for API routes
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
