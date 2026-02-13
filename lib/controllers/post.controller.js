import Post from '../models/Post.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

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

  const result = await cloudinary.uploader.upload(file.path || file.buffer, options);

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

// @route   POST /api/posts
// @desc    Create a new post (Teacher only)
// @access  Private (Teacher)
export const createPost = async (req, res) => {
  try {
    const { content, isPinned = false } = req.body;

    // Validate teacher role
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create posts'
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    if (content.length > 10000) {
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
    }

    // Validate video size
    if (video && video.size > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Video must be less than 50MB'
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
      content: content.trim(),
      media,
      isPinned: isPinned === 'true' || isPinned === true,
      pinnedAt: (isPinned === 'true' || isPinned === true) ? new Date() : null
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.postsCount': 1 }
    });

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
};

// @route   GET /api/posts
// @desc    Get paginated posts
// @access  Public
export const getPosts = async (req, res) => {
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
};

// @route   GET /api/posts/:postId
// @desc    Get single post
// @access  Public
export const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
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
};

// @route   PUT /api/posts/:postId
// @desc    Update post (Teacher only)
// @access  Private (Teacher)
export const updatePost = async (req, res) => {
  try {
    const { content, isPinned } = req.body;

    const post = await Post.findOne({
      _id: req.params.postId,
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
      post.content = content.trim();
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
};

// @route   DELETE /api/posts/:postId
// @desc    Soft delete post (Teacher only)
// @access  Private (Teacher)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
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
};

// @route   POST /api/posts/:postId/reactions
// @desc    Toggle reaction on post
// @access  Private
export const toggleReaction = async (req, res) => {
  try {
    const { type } = req.body;
    const validTypes = ['like', 'love', 'celebrate', 'insightful', 'question'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    const post = await Post.findOne({
      _id: req.params.postId,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    let reacted = false;

    // Remove any existing reaction from user
    for (const reactionType of validTypes) {
      const index = post.reactions[reactionType].indexOf(userId);
      if (index > -1) {
        post.reactions[reactionType].splice(index, 1);
        post.reactionsCount[reactionType]--;
        post.reactionsCount.total--;
      }
    }

    // Add new reaction if different from removed one
    const existingReaction = post.getUserReaction(userId);
    if (existingReaction !== type) {
      post.reactions[type].push(userId);
      post.reactionsCount[type]++;
      post.reactionsCount.total++;
      reacted = true;
    }

    await post.save();

    res.json({
      success: true,
      data: {
        reacted,
        type: reacted ? type : null,
        reactionsCount: post.reactionsCount
      }
    });
  } catch (error) {
    console.error('Toggle reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling reaction'
    });
  }
};

// @route   POST /api/posts/:postId/bookmark
// @desc    Toggle bookmark on post
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const isBookmarked = post.bookmarkedBy.some(id => id.toString() === userId.toString());

    if (isBookmarked) {
      // Remove bookmark
      post.bookmarkedBy = post.bookmarkedBy.filter(id => id.toString() !== userId.toString());
      post.bookmarksCount--;
    } else {
      // Add bookmark
      post.bookmarkedBy.push(userId);
      post.bookmarksCount++;
    }

    await post.save();

    res.json({
      success: true,
      data: {
        bookmarked: !isBookmarked
      }
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling bookmark'
    });
  }
};
