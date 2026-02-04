import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

let gridFSBucket = null

// Initialize GridFS bucket (lazy loading)
function getGridFSBucket() {
  if (!gridFSBucket) {
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('MongoDB connection not established')
    }
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    })
  }
  return gridFSBucket
}

// Upload file to GridFS
export async function uploadToGridFS(buffer, filename, metadata = {}) {
  const bucket = getGridFSBucket()

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date()
      }
    })

    uploadStream.on('error', reject)
    uploadStream.on('finish', (file) => {
      resolve({
        id: file._id,
        filename: file.filename,
        size: file.length,
        uploadedAt: file.uploadDate
      })
    })

    uploadStream.end(buffer)
  })
}

// Download file from GridFS (returns stream)
export function downloadFromGridFS(fileId) {
  const bucket = getGridFSBucket()
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
}

// Get file info from GridFS
export async function getGridFSFileInfo(fileId) {
  const bucket = getGridFSBucket()
  const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray()

  if (files.length === 0) {
    throw new Error('File not found in GridFS')
  }

  return files[0]
}

// Delete file from GridFS
export async function deleteFromGridFS(fileId) {
  const bucket = getGridFSBucket()
  await bucket.delete(new mongoose.Types.ObjectId(fileId))
}

// Check if file exists
export async function gridFSFileExists(fileId) {
  try {
    await getGridFSFileInfo(fileId)
    return true
  } catch (error) {
    return false
  }
}

export { getGridFSBucket }
