import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    role: 'teacher' | 'student';
  };
  content: string;
  contentHtml?: string;
  media: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnailUrl?: string;
    mimeType: string;
  }>;
  reactionsCount: {
    like: number;
    love: number;
    celebrate: number;
    insightful: number;
    question: number;
    total: number;
  };
  userReaction?: 'like' | 'love' | 'celebrate' | 'insightful' | 'question' | null;
  commentsCount: number;
  bookmarksCount: number;
  isBookmarked?: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    role: 'teacher' | 'student';
  };
  content: string;
  mentions?: string[];
  parentComment?: string | null;
  rootComment?: string | null;
  path?: string;
  depth: number;
  likesCount: number;
  repliesCount: number;
  totalRepliesCount?: number;
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  replies?: Comment[];
  hasMoreReplies?: boolean;
}

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pinnedComment?: Comment | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CommentResponse {
  success: boolean;
  data: {
    comment: Comment;
    parentChain?: Comment[];
  };
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

export interface CreatePostData {
  content: string;
  isPinned?: boolean;
  images?: File[];
  video?: File;
}

// Get paginated posts
export const getPosts = async (page = 1, limit = 10): Promise<PostsResponse> => {
  const response = await api.get('/posts', {
    params: { page, limit }
  });
  return response.data;
};

// Get single post
export const getPost = async (postId: string): Promise<{ success: boolean; data: { post: Post } }> => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

// Create post (teacher only)
export const createPost = async (data: CreatePostData): Promise<{ success: boolean; data: { post: Post } }> => {
  const formData = new FormData();
  formData.append('content', data.content);
  
  if (data.isPinned) {
    formData.append('isPinned', 'true');
  }
  
  if (data.images) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  
  if (data.video) {
    formData.append('video', data.video);
  }
  
  const response = await api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Update post
export const updatePost = async (postId: string, data: { content?: string; isPinned?: boolean }): Promise<{ success: boolean; data: { post: Post } }> => {
  const response = await api.put(`/posts/${postId}`, data);
  return response.data;
};

// Delete post
export const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

// Add reaction
export const addReaction = async (postId: string, type: 'like' | 'love' | 'celebrate' | 'insightful' | 'question'): Promise<{ success: boolean; data: any }> => {
  const response = await api.post(`/posts/${postId}/reactions`, { type });
  return response.data;
};

// Remove reaction
export const removeReaction = async (postId: string): Promise<{ success: boolean; data: any }> => {
  const response = await api.delete(`/posts/${postId}/reactions`);
  return response.data;
};

// Bookmark post
export const bookmarkPost = async (postId: string): Promise<{ success: boolean; data: { bookmarked: boolean } }> => {
  const response = await api.post(`/posts/${postId}/bookmark`);
  return response.data;
};

// Remove bookmark
export const removeBookmark = async (postId: string): Promise<{ success: boolean; data: { bookmarked: boolean } }> => {
  const response = await api.delete(`/posts/${postId}/bookmark`);
  return response.data;
};

// Get root comments for a post
export const getComments = async (
  postId: string,
  page = 1,
  limit = 10,
  sort: 'newest' | 'oldest' | 'popular' | 'discussed' = 'newest'
): Promise<CommentsResponse> => {
  const response = await api.get(`/posts/${postId}/comments`, {
    params: { page, limit, sort }
  });
  return response.data;
};

// Get replies for a comment
export const getReplies = async (
  commentId: string,
  page = 1,
  limit = 10
): Promise<{ success: boolean; data: { replies: Comment[] }; pagination: CommentsResponse['pagination'] }> => {
  const response = await api.get(`/comments/${commentId}/replies`, {
    params: { page, limit }
  });
  return response.data;
};

// Get single comment (with parent chain)
export const getComment = async (commentId: string): Promise<CommentResponse> => {
  const response = await api.get(`/comments/${commentId}`, {
    params: { context: true }
  });
  return response.data;
};

// Create comment
export const createComment = async (data: {
  postId: string;
  content: string;
  parentCommentId?: string;
}): Promise<{ success: boolean; data: { comment: Comment } }> => {
  const response = await api.post(`/posts/${data.postId}/comments`, {
    content: data.content,
    parentCommentId: data.parentCommentId
  });
  return response.data;
};

// Update comment
export const updateComment = async (
  commentId: string,
  content: string
): Promise<{ success: boolean; data: { comment: Comment } }> => {
  const response = await api.put(`/comments/${commentId}`, { content });
  return response.data;
};

// Delete comment
export const deleteComment = async (commentId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// Like comment
export const likeComment = async (commentId: string): Promise<{ success: boolean; data: { likesCount: number } }> => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};

// Unlike comment
export const unlikeComment = async (commentId: string): Promise<{ success: boolean; data: { likesCount: number } }> => {
  const response = await api.delete(`/comments/${commentId}/like`);
  return response.data;
};

// Pin comment (teacher only)
export const pinComment = async (commentId: string): Promise<{ success: boolean; data: { comment: Comment } }> => {
  const response = await api.post(`/comments/${commentId}/pin`);
  return response.data;
};

// Unpin comment (teacher only)
export const unpinComment = async (commentId: string): Promise<{ success: boolean; data: { comment: Comment } }> => {
  const response = await api.delete(`/comments/${commentId}/pin`);
  return response.data;
};

export default api;
