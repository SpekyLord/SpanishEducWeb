import multer from 'multer'
import File from '../models/File.js'
import Folder from '../models/Folder.js'
import { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } from '../services/gridfs.service.js'
import { uploadAudio, deleteFile as deleteCloudinaryFile } from '../services/cloudinary.service.js'

// Multer configuration (memory storage for processing)
const storage = multer.memoryStorage()

// File type validation
const ALLOWED_MIME_TYPES = {
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav']
}

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_MIME_TYPES.documents,
  ...ALLOWED_MIME_TYPES.presentations,
  ...ALLOWED_MIME_TYPES.spreadsheets,
  ...ALLOWED_MIME_TYPES.audio
]

const fileFilter = (req, file, cb) => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Invalid file type. Allowed: PDF, DOCX, PPTX, XLSX, MP3, WAV`), false)
  }
}

// Multer middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
})

// Helper: Determine storage type based on MIME type
function getStorageType(mimeType) {
  return ALLOWED_MIME_TYPES.audio.includes(mimeType) ? 'cloudinary' : 'gridfs'
}

// Helper: Update folder file count
async function updateFolderFileCount(folderId, increment = 1) {
  if (folderId) {
    await Folder.findByIdAndUpdate(folderId, {
      $inc: { filesCount: increment }
    })
  }
}

// Controller: Upload File
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const { folderId } = req.body
    const user = req.user

    // Validate folder if provided
    if (folderId && folderId !== 'null') {
      const folder = await Folder.findOne({ _id: folderId, isDeleted: false })
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' })
      }
    }

    const storageType = getStorageType(req.file.mimetype)
    const extension = req.file.originalname.split('.').pop().toLowerCase()

    let fileData = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extension,
      storageType,
      folder: folderId && folderId !== 'null' ? folderId : null,
      uploadedBy: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    }

    // Upload to appropriate storage
    if (storageType === 'gridfs') {
      const gridfsResult = await uploadToGridFS(
        req.file.buffer,
        req.file.originalname,
        {
          mimeType: req.file.mimetype,
          uploadedBy: user._id
        }
      )
      fileData.gridfsId = gridfsResult.id
      fileData.filename = gridfsResult.filename
    } else {
      // Cloudinary for audio
      // Convert buffer to base64 data URI for Cloudinary
      const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      const cloudinaryResult = await uploadAudio(base64File, {
        folder: 'spanishconnect/files/audio'
      })
      fileData.cloudinaryUrl = cloudinaryResult.url
      fileData.cloudinaryPublicId = cloudinaryResult.publicId
      fileData.filename = req.file.originalname
    }

    // Create file record
    const file = await File.create(fileData)

    // Update folder file count
    await updateFolderFileCount(file.folder, 1)

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        _id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        extension: file.extension,
        storageType: file.storageType,
        folder: file.folder,
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt
      }
    })
  } catch (error) {
    console.error('Upload file error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload file' })
  }
}

// Controller: Download File
export async function downloadFile(req, res) {
  try {
    const { id } = req.params
    const userId = req.user?._id

    const file = await File.findOne({ _id: id, isDeleted: false })
    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    // All authenticated users can download shared classroom files

    // Track download
    file.downloadsCount += 1
    if (userId) {
      file.downloadedBy.push({
        user: userId,
        downloadedAt: new Date()
      })
    }
    await file.save()

    // Stream from GridFS or redirect to Cloudinary
    if (file.storageType === 'gridfs') {
      const downloadStream = downloadFromGridFS(file.gridfsId)

      res.set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
      })

      downloadStream.on('error', (error) => {
        console.error('Download stream error:', error)
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' })
        }
      })

      downloadStream.pipe(res)
    } else {
      // Cloudinary - redirect to URL
      res.redirect(file.cloudinaryUrl)
    }
  } catch (error) {
    console.error('Download file error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download file' })
    }
  }
}

// Controller: Get Files (root level)
export async function getFiles(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query
    const skip = (page - 1) * limit

    // Get root folders
    const folders = await Folder.find({
      parentFolder: null,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)

    // Get root files
    const files = await File.find({
      folder: null,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)

    // Get total counts
    const totalFolders = await Folder.countDocuments({
      parentFolder: null,
      isDeleted: false
    })
    const totalFiles = await File.countDocuments({
      folder: null,
      isDeleted: false
    })

    res.json({
      folders,
      files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalFolders,
        totalFiles,
        totalPages: Math.ceil(Math.max(totalFolders, totalFiles) / limit)
      }
    })
  } catch (error) {
    console.error('Get files error:', error)
    res.status(500).json({ error: 'Failed to fetch files' })
  }
}

// Controller: Get Files in Folder
export async function getFilesInFolder(req, res) {
  try {
    const { folderId: id } = req.params
    const { page = 1, limit = 50 } = req.query
    const skip = (page - 1) * limit

    // Get folder
    const folder = await Folder.findOne({ _id: id, isDeleted: false })
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    // Get subfolders
    const subfolders = await Folder.find({
      parentFolder: id,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)

    // Get files
    const files = await File.find({
      folder: id,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)

    // Compute breadcrumbs from path
    const pathParts = folder.path.split('/').filter(p => p)
    const breadcrumbs = []

    let currentPath = ''
    for (const part of pathParts) {
      currentPath += '/' + part
      const breadcrumbFolder = await Folder.findOne({ path: currentPath })
      if (breadcrumbFolder) {
        breadcrumbs.push({
          _id: breadcrumbFolder._id,
          name: breadcrumbFolder.name,
          path: breadcrumbFolder.path
        })
      }
    }

    // Get total counts
    const totalSubfolders = await Folder.countDocuments({
      parentFolder: id,
      isDeleted: false
    })
    const totalFiles = await File.countDocuments({
      folder: id,
      isDeleted: false
    })

    res.json({
      folder: {
        _id: folder._id,
        name: folder.name,
        path: folder.path,
        depth: folder.depth,
        filesCount: folder.filesCount,
        createdBy: folder.createdBy
      },
      breadcrumbs,
      subfolders,
      files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalSubfolders,
        totalFiles,
        totalPages: Math.ceil(Math.max(totalSubfolders, totalFiles) / limit)
      }
    })
  } catch (error) {
    console.error('Get files in folder error:', error)
    res.status(500).json({ error: 'Failed to fetch folder contents' })
  }
}

// Controller: Create Folder
export async function createFolder(req, res) {
  try {
    const { name, parentFolderId } = req.body
    const user = req.user

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Folder name is required' })
    }

    // Validate parent folder if provided
    if (parentFolderId && parentFolderId !== 'null') {
      const parentFolder = await Folder.findOne({ _id: parentFolderId, isDeleted: false })
      if (!parentFolder) {
        return res.status(404).json({ error: 'Parent folder not found' })
      }
      if (parentFolder.depth >= 3) {
        return res.status(400).json({ error: 'Maximum folder depth of 3 levels exceeded' })
      }
    }

    // Check for duplicate name in same parent
    const existingFolder = await Folder.findOne({
      name: name.trim(),
      parentFolder: parentFolderId && parentFolderId !== 'null' ? parentFolderId : null,
      isDeleted: false
    })

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists in this location' })
    }

    // Create folder
    const folder = await Folder.create({
      name: name.trim(),
      parentFolder: parentFolderId && parentFolderId !== 'null' ? parentFolderId : null,
      createdBy: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    })

    res.status(201).json({
      message: 'Folder created successfully',
      folder: {
        _id: folder._id,
        name: folder.name,
        path: folder.path,
        depth: folder.depth,
        parentFolder: folder.parentFolder,
        createdBy: folder.createdBy,
        createdAt: folder.createdAt
      }
    })
  } catch (error) {
    console.error('Create folder error:', error)
    res.status(500).json({ error: error.message || 'Failed to create folder' })
  }
}

// Controller: Update File (rename)
export async function updateFile(req, res) {
  try {
    const { id } = req.params
    const { originalName } = req.body
    const userId = req.user._id

    const file = await File.findOne({ _id: id, isDeleted: false })
    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Only uploader can rename
    if (file.uploadedBy._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this file' })
    }

    if (originalName) {
      file.originalName = originalName
    }

    await file.save()

    res.json({
      message: 'File updated successfully',
      file: {
        _id: file._id,
        originalName: file.originalName,
        updatedAt: file.updatedAt
      }
    })
  } catch (error) {
    console.error('Update file error:', error)
    res.status(500).json({ error: 'Failed to update file' })
  }
}

// Controller: Move File
export async function moveFile(req, res) {
  try {
    const { id } = req.params
    const { targetFolderId } = req.body
    const userId = req.user._id

    const file = await File.findOne({ _id: id, isDeleted: false })
    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Only uploader can move
    if (file.uploadedBy._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to move this file' })
    }

    // Validate target folder if provided
    if (targetFolderId && targetFolderId !== 'null') {
      const targetFolder = await Folder.findOne({ _id: targetFolderId, isDeleted: false })
      if (!targetFolder) {
        return res.status(404).json({ error: 'Target folder not found' })
      }
    }

    const oldFolderId = file.folder

    // Update file folder
    file.folder = targetFolderId && targetFolderId !== 'null' ? targetFolderId : null
    await file.save()

    // Update folder file counts
    await updateFolderFileCount(oldFolderId, -1)
    await updateFolderFileCount(file.folder, 1)

    res.json({
      message: 'File moved successfully',
      file: {
        _id: file._id,
        folder: file.folder,
        updatedAt: file.updatedAt
      }
    })
  } catch (error) {
    console.error('Move file error:', error)
    res.status(500).json({ error: 'Failed to move file' })
  }
}

// Controller: Delete File or Folder
export async function deleteFile(req, res) {
  try {
    const { id } = req.params
    const { type } = req.query // 'file' or 'folder'
    const userId = req.user._id

    if (type === 'folder') {
      // Delete folder recursively
      const folder = await Folder.findOne({ _id: id, isDeleted: false })
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' })
      }

      // Only creator can delete
      if (folder.createdBy._id.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this folder' })
      }

      await deleteFolderRecursive(id)

      res.json({ message: 'Folder deleted successfully' })
    } else {
      // Delete file
      const file = await File.findOne({ _id: id, isDeleted: false })
      if (!file) {
        return res.status(404).json({ error: 'File not found' })
      }

      // Only uploader can delete
      if (file.uploadedBy._id.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this file' })
      }

      // Delete from storage
      if (file.storageType === 'gridfs') {
        await deleteFromGridFS(file.gridfsId)
      } else {
        await deleteCloudinaryFile(file.cloudinaryPublicId, 'video')
      }

      // Soft delete file
      file.isDeleted = true
      file.deletedAt = new Date()
      await file.save()

      // Update folder file count
      await updateFolderFileCount(file.folder, -1)

      res.json({ message: 'File deleted successfully' })
    }
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ error: 'Failed to delete' })
  }
}

// Helper: Recursive folder deletion
async function deleteFolderRecursive(folderId) {
  // Get all files in this folder
  const files = await File.find({ folder: folderId, isDeleted: false })

  // Delete all files
  for (const file of files) {
    if (file.storageType === 'gridfs') {
      await deleteFromGridFS(file.gridfsId)
    } else {
      await deleteCloudinaryFile(file.cloudinaryPublicId, 'video')
    }
    file.isDeleted = true
    file.deletedAt = new Date()
    await file.save()
  }

  // Get all subfolders
  const subfolders = await Folder.find({ parentFolder: folderId, isDeleted: false })

  // Recursively delete subfolders
  for (const subfolder of subfolders) {
    await deleteFolderRecursive(subfolder._id)
  }

  // Soft delete this folder
  await Folder.findByIdAndUpdate(folderId, {
    isDeleted: true,
    deletedAt: new Date()
  })
}
