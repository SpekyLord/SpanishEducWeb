import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required']
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required']
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    extension: {
      type: String,
      required: true
    },
    storageType: {
      type: String,
      enum: ['gridfs', 'cloudinary'],
      required: true
    },
    // GridFS storage
    gridfsId: {
      type: mongoose.Schema.Types.ObjectId
    },
    // Cloudinary storage
    cloudinaryUrl: String,
    cloudinaryPublicId: String,

    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null // null = root level
    },
    uploadedBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      displayName: { type: String, required: true },
      role: { type: String, enum: ['teacher', 'student'], required: true }
    },
    downloadsCount: {
      type: Number,
      default: 0
    },
    downloadedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        downloadedAt: { type: Date, default: Date.now },
        _id: false
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  { timestamps: true }
)

// Indexes
fileSchema.index({ folder: 1, createdAt: -1 })
fileSchema.index({ 'uploadedBy._id': 1 })
fileSchema.index({ filename: 'text', originalName: 'text' })
fileSchema.index({ isDeleted: 1, createdAt: -1 })

// Validation for storage-specific fields
fileSchema.pre('validate', function(next) {
  if (this.storageType === 'gridfs' && !this.gridfsId) {
    next(new Error('gridfsId required for GridFS storage'))
  } else if (this.storageType === 'cloudinary' && (!this.cloudinaryUrl || !this.cloudinaryPublicId)) {
    next(new Error('Cloudinary URL and publicId required for Cloudinary storage'))
  } else {
    next()
  }
})

const File = mongoose.model('File', fileSchema)
export default File
