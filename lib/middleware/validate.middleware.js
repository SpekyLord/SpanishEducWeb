export function validateBody(schema) {
  return (req, res, next) => {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field]

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` })
        continue
      }

      if (value !== undefined && value !== null) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push({ field, message: `${field} must be a string` })
        }

        if (rules.type === 'number' && typeof value !== 'number') {
          errors.push({ field, message: `${field} must be a number` })
        }

        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` })
        }

        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` })
        }

        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
          errors.push({ field, message: rules.patternMessage || `${field} format is invalid` })
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` })
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    next()
  }
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.query[field]

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` })
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    next()
  }
}
