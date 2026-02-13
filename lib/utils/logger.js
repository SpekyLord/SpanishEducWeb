import winston from 'winston'

// Detect serverless/production: Vercel sets VERCEL=1 automatically
const isServerless = !!(process.env.VERCEL || process.env.NODE_ENV === 'production')

const transports = [
  // Console transport always active
  new winston.transports.Console({
    format: isServerless
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(winston.format.colorize(), winston.format.simple())
  })
]

// Only add file transports in local development (serverless has read-only filesystem)
if (!isServerless) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  )
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'spanishconnect-api' },
  transports
})

// Helper methods for common logging patterns
logger.logError = (message, error, metadata = {}) => {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...metadata
  })
}

logger.logAuth = (action, userId, success, metadata = {}) => {
  logger.info('Auth event', {
    action,
    userId,
    success,
    ...metadata
  })
}

logger.logRequest = (method, path, userId, statusCode, duration) => {
  logger.info('API request', {
    method,
    path,
    userId,
    statusCode,
    duration: `${duration}ms`
  })
}

export default logger
