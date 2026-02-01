import { verifyAccessToken, getTokenFromHeader } from '../utils/jwt.js'
import User from '../models/User.js'

export async function authenticate(req, res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization)

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ error: 'Authentication error' })
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization)

    if (token) {
      const decoded = verifyAccessToken(token)
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password')
        if (user && user.isActive) {
          req.user = user
        }
      }
    }

    next()
  } catch (error) {
    next()
  }
}
