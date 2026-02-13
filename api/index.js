import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initCloudinary } from '../lib/config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Validate required secrets are configured
import { validateJWTConfig } from '../lib/utils/jwt.js'
validateJWTConfig()

// Initialize Cloudinary after env vars are loaded
initCloudinary()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { doubleCsrf } from 'csrf-csrf'
import logger from '../lib/utils/logger.js'
import connectDB from '../lib/utils/db.js'

// Import routes
import authRoutes from '../lib/routes/auth.routes.js'
import postsRoutes from '../lib/routes/posts.routes.js'
import commentsRoutes from '../lib/routes/comments.routes.js'
import filesRoutes from '../lib/routes/files.routes.js'
import messagesRoutes from '../lib/routes/messages.routes.js'
import notificationsRoutes from '../lib/routes/notifications.routes.js'
import usersRoutes from '../lib/routes/users.routes.js'

const app = express()

// Trust proxy for correct IP behind Vercel/reverse proxy (needed for rate limiting)
app.set('trust proxy', 1)

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      mediaSrc: ["'self'", "res.cloudinary.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
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
if (!process.env.CSRF_SECRET) {
  console.error('FATAL: CSRF_SECRET environment variable is not set. Exiting.')
  if (process.env.NODE_ENV === 'production') process.exit(1)
}

const {
  generateCsrfToken: generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => {
    if (!process.env.CSRF_SECRET) {
      throw new Error('CSRF_SECRET environment variable is required')
    }
    return process.env.CSRF_SECRET
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

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  try {
    const token = generateToken(req, res)
    res.json({ csrfToken: token })
  } catch (error) {
    console.error('CSRF token generation failed:', error.message)
    res.status(500).json({
      error: 'Failed to generate CSRF token'
    })
  }
})

// Apply CSRF protection to state-changing routes
app.use('/api/', (req, res, next) => {
  const method = req.method
  const reqPath = req.path

  // Skip CSRF for GET, HEAD, OPTIONS (read-only operations)
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next()
  }

  // Skip CSRF for auth endpoints (they use cookies directly)
  if (reqPath.startsWith('/auth/login') ||
      reqPath.startsWith('/auth/register') ||
      reqPath.startsWith('/auth/refresh') ||
      reqPath.startsWith('/auth/logout')) {
    return next()
  }

  // Apply CSRF protection to all other state-changing routes
  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      return next(err)
    }
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

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 search requests per minute per IP
  message: 'Too many search requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
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
app.get('/api/users/search', searchLimiter)
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
