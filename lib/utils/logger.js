import winston from 'winston'

const transports = []

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), only log to console (filesystem is read-only)
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }))
} else {
  // In development, log to files and console
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
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
