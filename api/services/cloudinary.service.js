import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload limits based on PRD
const UPLOAD_LIMITS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB for teacher, 2MB for student
    folder: 'spanishconnect/avatars',
    transformation: { width: 200, height: 200, crop: 'fill', quality: 'auto' },
  },
  postImage: {
    maxSize: 5 * 1024 * 1024, // 5MB
    maxCount: 5,
    folder: 'spanishconnect/posts/images',
    transformation: { width: 1200, quality: 'auto', fetch_format: 'auto' },
  },
  postVideo: {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxCount: 1,
    folder: 'spanishconnect/posts/videos',
    resource_type: 'video',
  },
  postAudio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxCount: 1,
    folder: 'spanishconnect/posts/audio',
    resource_type: 'video', // Cloudinary uses video for audio
  },
  messageAttachment: {
    maxSize: 2 * 1024 * 1024, // 2MB for students, 5MB for teacher
    folder: 'spanishconnect/messages',
    transformation: { width: 800, quality: 'auto' },
  },
}

export async function uploadImage(file, options = {}) {
  const { folder = 'spanishconnect', transformation = {} } = options

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: {
        quality: 'auto',
        fetch_format: 'auto',
        ...transformation,
      },
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

export async function uploadVideo(file, options = {}) {
  const { folder = 'spanishconnect/videos' } = options

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'video',
      eager: [{ format: 'mp4', quality: 'auto' }],
      eager_async: true,
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      thumbnailUrl: result.secure_url.replace(/\.[^.]+$/, '.jpg'),
    }
  } catch (error) {
    console.error('Cloudinary video upload error:', error)
    throw new Error('Failed to upload video')
  }
}

export async function deleteFile(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file')
  }
}

export async function deleteMultiple(publicIds, resourceType = 'image') {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    })
    return result
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error)
    throw new Error('Failed to delete files')
  }
}

export { UPLOAD_LIMITS }
export default cloudinary
