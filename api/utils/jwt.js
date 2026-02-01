import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const REFRESH_TOKEN_EXPIRY_REMEMBER = '30d'

export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  })
}

export function generateRefreshToken(payload, rememberMe = false) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: rememberMe ? REFRESH_TOKEN_EXPIRY_REMEMBER : REFRESH_TOKEN_EXPIRY,
  })
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (error) {
    return null
  }
}

export function getTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split(' ')[1]
}
