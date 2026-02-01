import mongoose from 'mongoose'

// File model - To be fully implemented in Phase 4
const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], required: true },
    mimeType: String,
    size: Number,
    // GridFS reference for documents
    gridFsId: mongoose.Schema.Types.ObjectId,
    // Folder structure
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    path: { type: String, default: '/' },
    depth: { type: Number, default: 0 },
    // Stats
    downloadCount: { type: Number, default: 0 },
    downloadedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        downloadedAt: { type: Date, default: Date.now },
      },
    ],
    // Metadata
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

fileSchema.index({ parentFolder: 1, createdAt: -1 })
fileSchema.index({ path: 1 })

const File = mongoose.model('File', fileSchema)

export default File
