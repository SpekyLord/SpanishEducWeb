import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initCloudinary } from './config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Initialize Cloudinary after env vars are loaded
initCloudinary()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { doubleCsrf } from 'csrf-csrf'
import logger from './utils/logger.js'
import connectDB from './utils/db.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import postsRoutes from './routes/posts.routes.js'
import commentsRoutes from './routes/comments.routes.js'
import filesRoutes from './routes/files.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import usersRoutes from './routes/users.routes.js'

const app = express()

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      mediaSrc: ["'self'", "res.cloudinary.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // In production, require origin header
      if (process.env.NODE_ENV === 'production' && !origin) {
        return callback(new Error('Origin header required in production'))
      }

      // In development, allow requests without origin (Postman, curl, etc.)
      if (process.env.NODE_ENV !== 'production' && !origin) {
        return callback(null, true)
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // In development, allow any localhost and local IP addresses
      if (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost:') || /^http:\/\/(192\.168|10\.|172\.)/.test(origin))) {
        return callback(null, true)
      }

      // Block all other origins
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    maxAge: 86400 // 24 hours
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// CSRF Protection Configuration
console.log('[CSRF] Initializing CSRF protection...')
console.log('[CSRF] Environment:', process.env.NODE_ENV)
console.log('[CSRF] CSRF_SECRET loaded:', process.env.CSRF_SECRET ? 'Yes (hidden)' : 'No')

const {
  generateCsrfToken: generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
    if (!process.env.CSRF_SECRET) {
      console.warn('[CSRF] WARNING: Using default CSRF secret! Set CSRF_SECRET in .env')
    }
    return secret
  },
  getSessionIdentifier: (req) => {
    // Use user ID if authenticated, otherwise use a session identifier from cookies
    return req.user?._id?.toString() || req.cookies['session-id'] || req.ip || 'anonymous'
  },
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
})

console.log('[CSRF] CSRF protection initialized')
console.log('[CSRF] generateToken type:', typeof generateToken)
console.log('[CSRF] doubleCsrfProtection type:', typeof doubleCsrfProtection)

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  try {
    console.log('[CSRF] Token generation requested')
    console.log('[CSRF] CSRF_SECRET exists:', !!process.env.CSRF_SECRET)
    console.log('[CSRF] generateToken function type:', typeof generateToken)

    const token = generateToken(req, res)

    console.log('[CSRF] Token generated successfully')
    console.log('[CSRF] Token length:', token?.length || 0)
    console.log('[CSRF] Cookie set:', res.getHeader('Set-Cookie') ? 'Yes' : 'No')

    res.json({ csrfToken: token })
  } catch (error) {
    console.error('[CSRF] Token generation FAILED:', error.message)
    console.error('[CSRF] Error stack:', error.stack)
    res.status(500).json({
      error: 'Failed to generate CSRF token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Apply CSRF protection to state-changing routes
app.use('/api/', (req, res, next) => {
  const method = req.method
  const path = req.path

  // Debug: Log all requests
  console.log(`[CSRF] ${method} ${path} - Checking CSRF protection...`)

  // Skip CSRF for GET, HEAD, OPTIONS (read-only operations)
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    console.log(`[CSRF] ${method} ${path} - Skipped (read-only method)`)
    return next()
  }

  // Skip CSRF for auth endpoints (they use cookies directly)
  if (path.startsWith('/auth/login') ||
      path.startsWith('/auth/register') ||
      path.startsWith('/auth/refresh') ||
      path.startsWith('/auth/logout')) {
    console.log(`[CSRF] ${method} ${path} - Skipped (auth endpoint)`)
    return next()
  }

  // Apply CSRF protection to all other state-changing routes
  console.log(`[CSRF] ${method} ${path} - Applying CSRF validation...`)

  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      console.error(`[CSRF] ${method} ${path} - VALIDATION FAILED:`, err.message)
      return next(err)
    }
    console.log(`[CSRF] ${method} ${path} - VALIDATION PASSED ✓`)
    next()
  })
})

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 600, // 600 requests per 10 min per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 write requests per 10 min per IP
  message: 'Too many write requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
})

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: 'Too many password reset requests, please try again later.',
})

// Apply API rate limiters
app.use('/api/', apiLimiter)
app.use('/api/', writeLimiter)

// Connect to database
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    logger.logError('Database connection error', error)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start
    const userId = req.user?._id || 'anonymous'

    logger.logRequest(
      req.method,
      req.path,
      userId,
      res.statusCode,
      duration
    )
  })

  next()
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
// Apply stricter rate limiting to auth endpoints
app.post('/api/auth/login', authLimiter)
app.post('/api/auth/register', authLimiter)
app.post('/api/auth/forgot-password', passwordResetLimiter)
app.post('/api/auth/reset-password', passwordResetLimiter)

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
  logger.logError('Server error', err, {
    method: req.method,
    path: req.path,
    userId: req.user?._id,
    statusCode: err.status || 500
  })

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
