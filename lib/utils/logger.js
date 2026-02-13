import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'spanishconnect-api' },
  transports: [
    // Write errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

// In development, also log to console with simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

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
