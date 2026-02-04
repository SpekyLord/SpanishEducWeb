import mongoose from 'mongoose'

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters']
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null // null = root folder
    },
    path: {
      type: String,
      required: true,
      default: '/'
    },
    depth: {
      type: Number,
      required: true,
      default: 0,
      max: [3, 'Maximum folder depth is 3 levels']
    },
    createdBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      displayName: { type: String, required: true },
      role: { type: String, enum: ['teacher', 'student'], required: true }
    },
    filesCount: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  { timestamps: true }
)

// Indexes
folderSchema.index({ parentFolder: 1, name: 1 })
folderSchema.index({ path: 1 })
folderSchema.index({ isDeleted: 1, createdAt: -1 })

// Pre-save middleware to compute path and depth
folderSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('parentFolder')) {
    if (!this.parentFolder) {
      // Root folder
      this.path = '/' + this.name
      this.depth = 0
    } else {
      // Nested folder - find parent and compute path
      const parent = await this.constructor.findById(this.parentFolder)
      if (!parent) {
        return next(new Error('Parent folder not found'))
      }
      if (parent.depth >= 3) {
        return next(new Error('Maximum folder depth of 3 levels exceeded'))
      }
      this.path = parent.path + '/' + this.name
      this.depth = parent.depth + 1
    }
  }
  next()
})

const Folder = mongoose.model('Folder', folderSchema)
export default Folder
