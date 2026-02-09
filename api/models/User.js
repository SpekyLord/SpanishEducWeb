import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Profile - Immutable
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-z0-9_]{3,30}$/,
    },

    // Profile - Mutable
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      default: 'student',
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },

    // Stats (denormalized for performance)
    stats: {
      commentsCount: { type: Number, default: 0 },
      likesGiven: { type: Number, default: 0 },
      downloadsCount: { type: Number, default: 0 },
      postsCount: { type: Number, default: 0 },
    },

    // Bookmarks
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Security
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginAt: Date,
    lastActiveAt: Date,

    // Refresh token tracking for rotation
    refreshTokens: [{
      token: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true }
    }],
  },
  {
    timestamps: true,
  }
)

// Indexes (email and username already indexed via unique: true in schema)
userSchema.index({ role: 1 })

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5
  const LOCK_TIME = 15 * 60 * 1000 // 15 minutes

  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1
    this.lockUntil = undefined
    return this.save()
  }

  this.loginAttempts += 1

  // Lock account if max attempts reached
  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = Date.now() + LOCK_TIME
  }

  return this.save()
}

// Transform output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.loginAttempts
  delete user.lockUntil
  delete user.emailVerificationToken
  delete user.emailVerificationExpires
  delete user.passwordResetToken
  delete user.passwordResetExpires
  return user
}

const User = mongoose.model('User', userSchema)

export default User
