import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// CSRF token management
let csrfToken: string | null = null;

// Fetch CSRF token from server
export async function initCSRF() {
  try {
    console.log('[CSRF Frontend] Fetching CSRF token from /api/csrf-token...');
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
    console.log('[CSRF Frontend] ✓ Token received:', csrfToken?.substring(0, 10) + '...');
    console.log('[CSRF Frontend] Token length:', csrfToken?.length || 0);
  } catch (error: any) {
    console.error('[CSRF Frontend] ✗ Failed to fetch CSRF token:', error);
    if (error.response) {
      console.error('[CSRF Frontend] Status:', error.response.status);
      console.error('[CSRF Frontend] Data:', error.response.data);
    }
  }
}

// Add auth token and CSRF token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token to state-changing requests
  const method = config.method?.toLowerCase();
  if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(method || '')) {
    config.headers['x-csrf-token'] = csrfToken;
    console.log(`[CSRF Frontend] Adding token to ${method?.toUpperCase()} ${config.url}`);
  }

  return config;
});

// Handle token refresh on 401 and CSRF refresh on 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - refresh access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 CSRF token error - refresh CSRF token and retry
    if (error.response?.status === 403 &&
        error.response?.data?.error?.includes('csrf') &&
        !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;

      console.log('[CSRF Frontend] 403 CSRF error detected, refreshing token...');

      try {
        await initCSRF();
        // Update the CSRF token header
        if (csrfToken) {
          originalRequest.headers['x-csrf-token'] = csrfToken;
          console.log('[CSRF Frontend] Retrying request with new token');
        }
        return api(originalRequest);
      } catch (csrfError) {
        console.error('[CSRF Frontend] Failed to refresh CSRF token:', csrfError);
        return Promise.reject(error);
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

export interface Folder {
  _id: string;
  name: string;
  path: string;
  depth: number;
  parentFolder: string | null;
  createdBy: {
    _id: string;
    username: string;
    displayName: string;
    role: 'teacher' | 'student';
  };
  filesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  storageType: 'gridfs' | 'cloudinary';
  folder: string | null;
  uploadedBy: {
    _id: string;
    username: string;
    displayName: string;
    role: 'teacher' | 'student';
  };
  downloadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Breadcrumb {
  _id: string;
  name: string;
  path: string;
}

export interface FilesResponse {
  folders: Folder[];
  files: FileItem[];
  pagination: {
    page: number;
    limit: number;
    totalFolders: number;
    totalFiles: number;
    totalPages: number;
  };
}

export interface FolderContentsResponse {
  folder: Folder;
  breadcrumbs: Breadcrumb[];
  subfolders: Folder[];
  files: FileItem[];
  pagination: {
    page: number;
    limit: number;
    totalSubfolders: number;
    totalFiles: number;
    totalPages: number;
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

// Files & Folders API

// Get root files and folders
export const getFiles = async (page = 1, limit = 50): Promise<FilesResponse> => {
  const response = await api.get('/files', {
    params: { page, limit }
  });
  return response.data;
};

// Get files in a specific folder
export const getFilesInFolder = async (folderId: string, page = 1, limit = 50): Promise<FolderContentsResponse> => {
  const response = await api.get(`/files/folder/${folderId}`, {
    params: { page, limit }
  });
  return response.data;
};

// Upload file
export const uploadFile = async (file: File, folderId?: string | null): Promise<{ message: string; file: FileItem }> => {
  const formData = new FormData();
  formData.append('file', file);

  if (folderId) {
    formData.append('folderId', folderId);
  }

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Download file
export const downloadFile = async (fileId: string): Promise<Blob> => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

// Create folder
export const createFolder = async (name: string, parentFolderId?: string | null): Promise<{ message: string; folder: Folder }> => {
  const response = await api.post('/files/folder', {
    name,
    parentFolderId
  });
  return response.data;
};

// Rename file
export const renameFile = async (fileId: string, newName: string): Promise<{ message: string; file: FileItem }> => {
  const response = await api.put(`/files/${fileId}`, {
    originalName: newName
  });
  return response.data;
};

// Move file to different folder
export const moveFile = async (fileId: string, targetFolderId: string | null): Promise<{ message: string; file: FileItem }> => {
  const response = await api.patch(`/files/${fileId}/move`, {
    targetFolderId
  });
  return response.data;
};

// Delete file or folder
export const deleteFileOrFolder = async (id: string, type: 'file' | 'folder'): Promise<{ message: string }> => {
  const response = await api.delete(`/files/${id}`, {
    params: { type }
  });
  return response.data;
};

// Messages & Conversations Types

export interface MessageUser {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'teacher' | 'student';
}

export interface Message {
  _id: string;
  conversation: string;
  sender: MessageUser;
  content: string;
  image?: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  };
  isRead: boolean;
  readBy: string[];
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    user: string;
    unreadCount: number;
    lastReadAt?: string;
  }>;
  otherUser: MessageUser;
  lastMessage?: {
    content: string;
    sender: MessageUser;
    hasImage: boolean;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

// Messages & Conversations API

// Get all conversations
export const getConversations = async (): Promise<{
  success: boolean;
  data: { conversations: Conversation[] };
}> => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// Get or create conversation with a user
export const getConversation = async (userId: string): Promise<{
  success: boolean;
  data: { conversation: Conversation };
}> => {
  const response = await api.get(`/messages/conversation/${userId}`);
  return response.data;
};

// Get messages in a conversation
export const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 30
): Promise<{
  success: boolean;
  data: { messages: Message[] };
  pagination: any;
}> => {
  const response = await api.get(`/messages/conversation/${conversationId}/messages`, {
    params: { page, limit }
  });
  return response.data;
};

// Send message with optional image
export const sendMessage = async (formData: FormData): Promise<{
  success: boolean;
  data: { message: Message; conversation: Conversation };
}> => {
  const response = await api.post('/messages/send', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Mark messages as read
export const markAsRead = async (conversationId: string): Promise<{
  success: boolean;
  data: { markedRead: number };
}> => {
  const response = await api.patch(`/messages/conversation/${conversationId}/read`);
  return response.data;
};

// Notifications Types

export interface Notification {
  _id: string;
  type: 'comment_reply' | 'comment_like' | 'mention' | 'new_post' | 'pinned_comment' | 'direct_message';
  actor: {
    _id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
  reference: {
    type: 'post' | 'comment' | 'message';
    id: string;
    postId?: string;
  };
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Notifications API

// Get notifications with pagination
export const getNotifications = async (page = 1, limit = 20): Promise<{
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}> => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<{
  success: boolean;
  data: { count: number };
}> => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

// Mark single notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{
  success: boolean;
  data: { notification: Notification };
}> => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  message: string;
  data: { modifiedCount: number };
}> => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

export default api;
