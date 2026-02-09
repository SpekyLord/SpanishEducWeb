export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/

export function validateEmail(email) {
  return emailRegex.test(email)
}

export function validatePassword(password) {
  const errors = []
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUsername(username) {
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores',
    }
  }
  return { isValid: true }
}

import xss from 'xss'

// Sanitize plain text content (no HTML allowed)
export function sanitizeString(str) {
  if (typeof str !== 'string') return ''

  // Use xss library for comprehensive sanitization
  const cleaned = xss(str, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  })

  return cleaned.trim()
}

// Sanitize HTML content with allowed safe tags
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return ''

  // For rich text content, allow specific safe tags
  return xss(html, {
    whiteList: {
      p: [],
      br: [],
      strong: [],
      em: [],
      u: [],
      a: ['href', 'title'],
      ul: [],
      ol: [],
      li: [],
      h1: [],
      h2: [],
      h3: [],
      blockquote: [],
      code: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe']
  })
}
