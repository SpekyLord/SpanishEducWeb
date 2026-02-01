import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { validateEmail, validatePassword, validateUsername } from '../utils/validators.js'

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
      displayName,
      username: finalUsername,
      role: 'student',
    })

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id })
    const refreshToken = generateRefreshToken({ userId: user._id })

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
      await user.save()
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id })
    const refreshToken = generateRefreshToken({ userId: user._id }, rememberMe)

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
    const token = req.cookies.refreshToken
    if (!token) {
      return res.status(401).json({ error: 'Refresh token not found' })
    }

    const decoded = verifyRefreshToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    const accessToken = generateAccessToken({ userId: user._id })

    res.json({ accessToken })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ error: 'Token refresh failed' })
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
}

export async function getCurrentUser(req, res) {
  res.json({ user: req.user })
}

export async function forgotPassword(req, res) {
  // TODO: Implement password reset email
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function resetPassword(req, res) {
  // TODO: Implement password reset
  res.status(501).json({ error: 'Not implemented yet' })
}
