import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { validateEmail, validatePassword, validateUsername, sanitizeString } from '../utils/validators.js'

export async function register(req, res) {
  try {
    const { email, password, displayName, username } = req.body

    // Validate input
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.errors[0] })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')

    const usernameValidation = validateUsername(finalUsername)
    if (!usernameValidation.isValid) {
      return res.status(400).json({ error: usernameValidation.error })
    }

    // Check username uniqueness
    const existingUsername = await User.findOne({ username: finalUsername })
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName: sanitizeString(displayName.trim()),
      username: finalUsername,
      role: 'student',
    })

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id })
    const refreshToken = generateRefreshToken({ userId: user._id })
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    // Store refresh token for rotation tracking
    user.refreshTokens = [{
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }]
    user.lastLoginAt = new Date()
    await user.save()

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      accessToken,
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ error: 'Account is temporarily locked. Try again later.' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      // Increment failed attempts
      await user.incrementLoginAttempts()
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0
      user.lockUntil = undefined
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id })
    const refreshToken = generateRefreshToken({ userId: user._id }, rememberMe)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    // Store refresh token for rotation tracking
    if (!user.refreshTokens) {
      user.refreshTokens = []
    }
    user.refreshTokens.push({
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000))
    })

    // Clean up expired tokens (limit to 5 active tokens per user)
    user.refreshTokens = user.refreshTokens
      .filter(t => t.expiresAt > new Date())
      .slice(-5)

    user.lastLoginAt = new Date()
    await user.save()

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

export async function refreshToken(req, res) {
  try {
    const oldToken = req.cookies.refreshToken
    if (!oldToken) {
      return res.status(401).json({ error: 'Refresh token not found' })
    }

    const decoded = verifyRefreshToken(oldToken)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    // Check if token exists in user's valid tokens
    let tokenIndex = -1
    if (user.refreshTokens) {
      for (let i = 0; i < user.refreshTokens.length; i++) {
        try {
          const matches = await bcrypt.compare(oldToken, user.refreshTokens[i].token)
          if (matches) {
            tokenIndex = i
            break
          }
        } catch (err) {
          // skip invalid hashes
        }
      }
    }

    if (tokenIndex === -1 || !user.refreshTokens[tokenIndex]) {
      return res.status(401).json({ error: 'Token revoked or invalid' })
    }

    // Remove old token
    user.refreshTokens.splice(tokenIndex, 1)

    // Generate new tokens
    const accessToken = generateAccessToken({ userId: user._id })
    const newRefreshToken = generateRefreshToken({ userId: user._id })
    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10)

    // Store new refresh token
    user.refreshTokens.push({
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Clean up expired tokens
    user.refreshTokens = user.refreshTokens.filter(t =>
      t.expiresAt > new Date()
    )

    await user.save()

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken })
  } catch (error) {
    console.error('Refresh token error:', error.message)
    res.status(401).json({ error: 'Token refresh failed' })
  }
}

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken
    const user = req.user

    if (user && refreshToken) {
      // Remove this specific token from user's valid tokens
      const filtered = []
      for (const t of (user.refreshTokens || [])) {
        try {
          const matches = await bcrypt.compare(refreshToken, t.token)
          if (!matches) {
            filtered.push(t)
          }
        } catch (err) {
          filtered.push(t) // Keep tokens that can't be compared
        }
      }
      user.refreshTokens = filtered
      await user.save()
    }

    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookie even if there's an error
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  }
}

export async function getCurrentUser(req, res) {
  res.json({ user: req.user })
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.json({ message: 'If email exists, reset link has been sent' })
    }

    // Use crypto for secure token generation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetToken, 12)

    user.passwordResetToken = resetTokenHash
    user.passwordResetExpires = Date.now() + (30 * 60 * 1000) // 30 minutes
    await user.save()

    // TODO: Send email with reset link via email service (Resend, SendGrid, etc.)
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`
    // await sendPasswordResetEmail(user.email, resetUrl)

    console.log('Password reset requested for:', email)

    // NEVER return token in response - only send via email
    res.json({
      message: 'If email exists, reset link has been sent via email'
    })
  } catch (error) {
    console.error('Forgot password error:', error.message)
    res.status(500).json({ error: 'Password reset request failed' })
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, email, newPassword } = req.body

    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: 'Token, email, and new password are required' })
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.errors[0] })
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user || !user.passwordResetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, user.passwordResetToken)
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid reset token' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password and clear reset token + invalidate ALL refresh tokens
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.loginAttempts = 0
    user.lockUntil = undefined
    user.refreshTokens = [] // Force re-login on all devices
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Password reset failed' })
  }
}
