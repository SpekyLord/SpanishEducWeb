import Post from '../models/Post.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { sanitizeString } from '../utils/validators.js';

// Magic byte signatures for allowed file types
const MAGIC_BYTES = {
  // Images
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
  'image/gif': [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
  'image/webp': null, // checked via RIFF header below
  // Videos
  'video/mp4': null, // checked via ftyp box below
  'video/quicktime': null, // also uses ftyp
  'video/mpeg': [Buffer.from([0x00, 0x00, 0x01, 0xBA]), Buffer.from([0x00, 0x00, 0x01, 0xB3])],
  'video/x-msvideo': [Buffer.from('RIFF')],
}

function validateMagicBytes(buffer, claimedMime) {
  if (!buffer || buffer.length < 12) return false

  // WEBP: RIFF....WEBP
  if (claimedMime === 'image/webp') {
    return buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP'
  }

  // MP4/MOV: ftyp box at offset 4
  if (claimedMime === 'video/mp4' || claimedMime === 'video/quicktime') {
    return buffer.slice(4, 8).toString() === 'ftyp'
  }

  const signatures = MAGIC_BYTES[claimedMime]
  if (!signatures) return false

  return signatures.some(sig => {
    if (buffer.length < sig.length) return false
    return buffer.slice(0, sig.length).equals(sig)
  })
}

// Helper: Create author object from user
const createAuthorObject = (user) => ({
  _id: user._id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatar?.url || null,
  role: user.role
});

// Helper: Upload media to Cloudinary
const uploadMedia = async (file, type) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const options = {
    folder: 'spanishconnect/posts',
    resource_type: type === 'video' ? 'video' : 'image'
  };

  if (type === 'image') {
    options.transformation = [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' }
    ];
  } else if (type === 'video') {
    options.transformation = [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto:good' }
    ];
  }

  // Handle both file path and buffer
  const uploadSource = file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(uploadSource, options);

  const media = {
    type,
    url: result.secure_url,
    publicId: result.public_id,
    mimeType: file.mimetype
  };

  if (type === 'image') {
    media.width = result.width;
    media.height = result.height;
  } else if (type === 'video') {
    media.width = result.width;
    media.height = result.height;
    media.duration = result.duration;
    media.thumbnailUrl = result.secure_url.replace(/\.[^.]+$/, '.jpg');
  }

  return media;
};

export async function getPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const pinnedOnly = req.query.pinned === 'true';

    const query = { isDeleted: false };
    if (pinnedOnly) {
      query.isPinned = true;
    }

    const result = await Post.getPostsWithUserInfo(
      query,
      req.user?._id,
      { page, limit }
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add user-specific info
    if (req.user) {
      post.userReaction = Post.prototype.getUserReaction.call(post, req.user._id);
      post.isBookmarked = post.bookmarkedBy.some(id => id.toString() === req.user._id.toString());
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post'
    });
  }
}

export async function createPost(req, res) {
  try {
    const { content, isPinned = false } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = sanitizeString(content.trim());

    if (sanitizedContent.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot exceed 10000 characters'
      });
    }

    // Process media uploads
    const media = [];
    const images = req.files?.images || [];
    const video = req.files?.video?.[0];

    // Validate image count
    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed per post'
      });
    }

    // Validate image sizes
    for (const image of images) {
      if (image.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Each image must be less than 5MB'
        });
      }
      // Verify magic bytes match claimed MIME type
      if (!validateMagicBytes(image.buffer, image.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image file — content does not match file type'
        });
      }
    }

    // Validate video size
    if (video && video.size > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Video must be less than 50MB'
      });
    }

    // Verify video magic bytes
    if (video && !validateMagicBytes(video.buffer, video.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid video file — content does not match file type'
      });
    }

    // Upload images
    for (const image of images) {
      try {
        const uploadedMedia = await uploadMedia(image, 'image');
        media.push(uploadedMedia);
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    }

    // Upload video
    if (video) {
      try {
        const uploadedMedia = await uploadMedia(video, 'video');
        media.push(uploadedMedia);
      } catch (error) {
        console.error('Video upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload video'
        });
      }
    }

    // Create post
    const post = await Post.create({
      author: createAuthorObject(req.user),
      content: sanitizedContent,
      media,
      isPinned: isPinned === 'true' || isPinned === true,
      pinnedAt: (isPinned === 'true' || isPinned === true) ? new Date() : null
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.postsCount': 1 }
    })

    res.status(201).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
}

export async function updatePost(req, res) {
  try {
    const { content, isPinned } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the post author
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Update fields
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Content cannot be empty'
        });
      }
      // Sanitize content to prevent XSS attacks
      post.content = sanitizeString(content.trim());
    }

    if (isPinned !== undefined) {
      post.isPinned = isPinned;
      post.pinnedAt = isPinned ? new Date() : null;
    }

    await post.save();

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating post'
    });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the post author
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
}

export async function pinPost(req, res) {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isPinned = true;
    post.pinnedAt = new Date();
    await post.save();

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Pin post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error pinning post'
    });
  }
}

export async function unpinPost(req, res) {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isPinned = false;
    post.pinnedAt = null;
    await post.save();

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Unpin post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unpinning post'
    });
  }
}

export async function addReaction(req, res) {
  try {
    const { type } = req.body;
    const validTypes = ['like', 'love', 'celebrate', 'insightful', 'question'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    const postId = req.params.id;
    const userId = req.user._id;

    // First, atomically remove user from ALL reaction arrays
    const pullUpdate = {};
    const decUpdate = {};
    for (const rt of validTypes) {
      pullUpdate[`reactions.${rt}`] = userId;
    }

    // Find which reaction(s) the user currently has, then remove them
    const currentPost = await Post.findOne({ _id: postId, isDeleted: false }).lean();
    if (!currentPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let totalDec = 0;
    for (const rt of validTypes) {
      if (currentPost.reactions[rt]?.some(id => id.toString() === userId.toString())) {
        decUpdate[`reactionsCount.${rt}`] = -1;
        totalDec++;
      }
    }
    if (totalDec > 0) decUpdate['reactionsCount.total'] = -totalDec;

    // Atomic: remove old reactions + decrement counts
    if (Object.keys(decUpdate).length > 0) {
      await Post.updateOne(
        { _id: postId, isDeleted: false },
        { $pull: pullUpdate, $inc: decUpdate }
      );
    }

    // Atomic: add new reaction + increment counts
    const post = await Post.findOneAndUpdate(
      { _id: postId, isDeleted: false },
      {
        $addToSet: { [`reactions.${type}`]: userId },
        $inc: { [`reactionsCount.${type}`]: 1, 'reactionsCount.total': 1 }
      },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        type,
        reactionsCount: post.reactionsCount
      }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
}

export async function getReactions(req, res) {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    })
      .populate('reactions.like', 'username displayName avatarUrl')
      .populate('reactions.love', 'username displayName avatarUrl')
      .populate('reactions.celebrate', 'username displayName avatarUrl')
      .populate('reactions.insightful', 'username displayName avatarUrl')
      .populate('reactions.question', 'username displayName avatarUrl')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      data: {
        reactions: {
          like: post.reactions.like,
          love: post.reactions.love,
          celebrate: post.reactions.celebrate,
          insightful: post.reactions.insightful,
          question: post.reactions.question
        },
        reactionsCount: post.reactionsCount
      }
    })
  } catch (error) {
    console.error('Get reactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching reactions'
    })
  }
}

export async function removeReaction(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const validTypes = ['like', 'love', 'celebrate', 'insightful', 'question'];

    // Find which reaction type the user has
    const currentPost = await Post.findOne({ _id: postId, isDeleted: false }).lean();
    if (!currentPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let foundType = null;
    for (const rt of validTypes) {
      if (currentPost.reactions[rt]?.some(id => id.toString() === userId.toString())) {
        foundType = rt;
        break;
      }
    }

    if (foundType) {
      // Atomic remove
      const post = await Post.findOneAndUpdate(
        { _id: postId, isDeleted: false },
        {
          $pull: { [`reactions.${foundType}`]: userId },
          $inc: { [`reactionsCount.${foundType}`]: -1, 'reactionsCount.total': -1 }
        },
        { new: true }
      );

      return res.json({
        success: true,
        data: { reactionsCount: post.reactionsCount }
      });
    }

    res.json({
      success: true,
      data: { reactionsCount: currentPost.reactionsCount }
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing reaction'
    });
  }
}

export async function bookmarkPost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Atomic: add bookmark only if not already present
    const post = await Post.findOneAndUpdate(
      { _id: postId, isDeleted: false, bookmarkedBy: { $ne: userId } },
      {
        $addToSet: { bookmarkedBy: userId },
        $inc: { bookmarksCount: 1 }
      },
      { new: true }
    );

    if (!post) {
      // Either post not found or already bookmarked
      const exists = await Post.findOne({ _id: postId, isDeleted: false });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
    }

    res.json({
      success: true,
      data: { bookmarked: true }
    });
  } catch (error) {
    console.error('Bookmark post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error bookmarking post'
    });
  }
}

export async function removeBookmark(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Atomic: remove bookmark
    const post = await Post.findOneAndUpdate(
      { _id: postId, isDeleted: false, bookmarkedBy: userId },
      {
        $pull: { bookmarkedBy: userId },
        $inc: { bookmarksCount: -1 }
      },
      { new: true }
    );

    if (!post) {
      const exists = await Post.findOne({ _id: postId, isDeleted: false });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
    }

    res.json({
      success: true,
      data: { bookmarked: false }
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing bookmark'
    });
  }
}
