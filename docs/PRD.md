# SpanishConnect - Product Requirements Document

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Approved for Development

---

## 1. Executive Summary

### 1.1 Vision
SpanishConnect is a Facebook-style educational platform for Spanish language instruction, combining social engagement with focused learning tools.

### 1.2 Problem & Solution

| Problem | Solution |
|---------|----------|
| Social media distractions | Dedicated educational platform |
| LMS too complex | Streamlined, intuitive UX |
| Low engagement | Reactions, nested comments, messaging |
| High costs | 100% free tier infrastructure |

### 1.3 Tech Stack

| Component | Technology | Limit |
|-----------|------------|-------|
| Frontend | React.js + Vite | - |
| Backend | Node.js/Express Serverless | 10s timeout |
| Database | MongoDB Atlas M0 | 512MB |
| Media | Cloudinary Free | 25GB storage |
| Hosting | Vercel Hobby | - |
| Auth | JWT + httpOnly cookies | - |

---

## 2. User Roles & Permissions

### 2.1 Teacher (Single Admin)
- Create/edit/delete posts with media
- Upload files (images 5MB×5, video 50MB×1, docs 10MB)
- Manage all comments (delete, pin)
- Message any student
- Access analytics
- Pin up to 3 posts

### 2.2 Student
- View feed, react to posts (👍❤️🎉💡❓)
- Comment with unlimited nesting
- Like comments, reply at any depth
- Edit own comments (15min window)
- Delete own comments (soft delete)
- Download files, bookmark posts
- Message teacher only

### 2.3 Guest (Unauthenticated)
- View public feed (read-only)
- View collapsed comments
- View file listings (no download)
- Registration prompt on interaction

---

## 3. Core Features

### 3.1 Authentication
- Email/password registration
- JWT access tokens (15min) + refresh tokens (7 days)
- httpOnly cookie storage
- Password reset via email

### 3.2 Home Feed
- Chronological posts, 10 per page, infinite scroll
- Rich text content with media attachments
- 5 reaction types with counts
- Bookmark functionality
- Pinned posts section (max 3)

### 3.3 Infinite Nested Comments

**Structure:**
```
Comment (depth 0)
├── Reply (depth 1)
│   ├── Reply (depth 2)
│   │   └── Reply (depth 3)
│   │       └── ... (unlimited)
│   └── Reply (depth 2)
└── Reply (depth 1)
```

**Features:**
- Unlimited nesting depth
- Visual indentation (40px desktop, 24px mobile)
- Thread lines connecting parent-child
- Collapse/expand at any level
- Lazy loading: 10 root comments, 3 replies initially
- Sort: Newest, Oldest, Most Liked, Most Discussed
- Teacher can pin 1 comment per post
- Deep linking: `/post/:id#comment-:commentId`
- @mentions with notifications

**Pagination:**
- Root: Load 10 more on click
- Replies: "View X more replies" loads 5

### 3.4 Files/Modules
- Folder organization
- Upload: PDF, DOCX, PPTX (max 10MB)
- Storage: MongoDB GridFS
- Download tracking per user

### 3.5 Messaging
- Student ↔ Teacher only
- Text + image attachments (2MB max)
- Read receipts
- Polling updates (30s)

### 3.6 Notifications
- Comment replies
- Likes (batched)
- New posts
- @mentions
- Pinned comments

---

## 4. Database Schemas

### 4.1 Users
```javascript
{
  _id: ObjectId,
  email: String,              // unique
  passwordHash: String,
  username: String,           // unique, immutable
  displayName: String,
  role: "teacher" | "student",
  avatarUrl: String,
  bio: String,                // max 500
  stats: { commentsCount, likesGiven, downloadsCount },
  refreshTokens: [{ token, expiresAt }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Posts
```javascript
{
  _id: ObjectId,
  author: { _id, username, displayName, avatarUrl, role },
  content: String,            // max 10000
  media: [{ type, url, publicId, width, height }],
  reactions: { like: [userId], love: [], celebrate: [], insightful: [], question: [] },
  reactionsCount: { like: 0, love: 0, ..., total: 0 },
  commentsCount: Number,
  bookmarkedBy: [userId],
  isPinned: Boolean,
  isDeleted: Boolean,
  createdAt: Date
}
```

### 4.3 Comments
```javascript
{
  _id: ObjectId,
  post: ObjectId,             // indexed
  author: { _id, username, displayName, avatarUrl, role },
  
  // Threading
  parentComment: ObjectId | null,
  rootComment: ObjectId | null,
  path: String,               // "rootId/parentId/thisId"
  depth: Number,              // 0 = root
  
  content: String,            // max 2000
  mentions: [String],
  
  likes: [ObjectId],
  likesCount: Number,
  repliesCount: Number,
  
  isPinned: Boolean,
  isDeleted: Boolean,
  isEdited: Boolean,
  
  createdAt: Date,
  editedAt: Date
}

// Indexes
{ post: 1, parentComment: 1, createdAt: -1 }
{ post: 1, rootComment: 1, path: 1 }
{ post: 1, isPinned: 1 }
```

### 4.4 Files
```javascript
{
  _id: ObjectId,
  filename: String,
  mimeType: String,
  size: Number,
  folder: ObjectId,
  gridfsId: ObjectId,
  uploadedBy: ObjectId,
  downloadsCount: Number,
  createdAt: Date
}
```

### 4.5 Messages
```javascript
{
  _id: ObjectId,
  conversation: ObjectId,
  sender: { _id, username, displayName, avatarUrl },
  content: String,
  attachments: [{ url, publicId }],
  readAt: Date,
  createdAt: Date
}
```

### 4.6 Notifications
```javascript
{
  _id: ObjectId,
  recipient: ObjectId,
  type: "comment_reply" | "comment_like" | "mention" | "new_post",
  actor: { _id, username, displayName, avatarUrl },
  reference: { type, id, preview },
  isRead: Boolean,
  createdAt: Date
}
```

---

## 5. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get tokens |
| POST | /api/auth/logout | Clear tokens |
| POST | /api/auth/refresh | Rotate tokens |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts | List posts (paginated) |
| POST | /api/posts | Create post (teacher) |
| GET | /api/posts/:id | Get single post |
| PUT | /api/posts/:id | Edit post (teacher) |
| DELETE | /api/posts/:id | Delete post (teacher) |
| POST | /api/posts/:id/reactions | Toggle reaction |
| POST | /api/posts/:id/bookmark | Toggle bookmark |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts/:id/comments | List root comments |
| POST | /api/posts/:id/comments | Create comment |
| GET | /api/comments/:id | Get with context |
| GET | /api/comments/:id/replies | Get replies |
| PUT | /api/comments/:id | Edit (15min window) |
| DELETE | /api/comments/:id | Soft delete |
| POST | /api/comments/:id/like | Toggle like |
| POST | /api/comments/:id/pin | Pin (teacher) |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/files | List files |
| POST | /api/files | Upload (teacher) |
| GET | /api/files/:id | Download |
| DELETE | /api/files/:id | Delete (teacher) |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/messages | List conversations |
| POST | /api/messages | Send message |
| GET | /api/messages/:id | Get conversation |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List notifications |
| POST | /api/notifications/read | Mark as read |

---

## 6. Comment System Deep Dive

### 6.1 Threading Algorithm

**Create Comment:**
1. Validate content (length, sanitize)
2. If reply: fetch parent, calculate `depth = parent.depth + 1`
3. Set `path = parent.path + "/" + newId`
4. Set `rootComment = parent.rootComment || parent._id`
5. Save comment
6. Update parent's `repliesCount++`
7. Update root's `totalRepliesCount++`
8. Update post's `commentsCount++`
9. Create notifications

**Fetch Thread:**
```javascript
// Get root comments
db.comments.find({ 
  post: postId, 
  parentComment: null 
}).sort({ createdAt: -1 }).limit(10)

// Get replies for a comment
db.comments.find({ 
  parentComment: commentId 
}).sort({ createdAt: -1 }).limit(5)

// Get entire thread (deep link)
db.comments.find({ 
  $or: [
    { _id: commentId },
    { path: { $regex: `^.*${commentId}.*` } }
  ]
})
```

### 6.2 Edge Cases

| Case | Handling |
|------|----------|
| Deleted parent with replies | Show "[Comment deleted]", preserve children |
| Deep link to nested comment | Fetch parent chain, expand all ancestors |
| Mobile deep nesting | Cap indent at 72px, continue thread lines |
| Rate limiting | Max 10 comments/minute per user |

### 6.3 Performance

- **Optimistic updates**: Show comment immediately, sync after
- **Debounced likes**: 300ms delay prevents spam
- **Virtual scrolling**: For 100+ comments
- **Caching**: 30s stale time, 5min cache

---

## 7. Cloudinary Strategy

### Folder Structure
```
spanishconnect/
├── avatars/{userId}/
├── posts/{postId}/images/
├── posts/{postId}/videos/
├── messages/{conversationId}/
└── covers/{userId}/
```

### Transformations
| Asset | Transform |
|-------|-----------|
| Avatar | 150×150 thumb, 400×400 medium |
| Post image | 600px width feed, original lightbox |
| Video | Adaptive streaming, lazy load |

### Limits
- Images: 5MB each, max 5 per post
- Videos: 50MB, max 1 per post
- Message attachments: 2MB

---

## 8. Storage Budget (512MB)

| Collection | Size |
|------------|------|
| Users | 100KB |
| Posts | 1MB |
| Comments | 5MB |
| Messages | 1.5MB |
| Files (meta) | 100KB |
| Notifications | 2MB |
| GridFS (docs) | ~400MB |
| **Total** | **~410MB** |

---

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [x] Project setup
- [ ] Auth system
- [ ] Basic posts/feed
- [ ] Root-level comments
- [ ] User profiles

### Phase 2: Core (Weeks 4-5)
- [ ] Nested comments (infinite depth)
- [ ] Threading UI
- [ ] Collapse/expand
- [ ] Comment pagination
- [ ] Reactions
- [ ] Files section

### Phase 3: Communication (Week 6)
- [ ] Messaging
- [ ] Notifications
- [ ] @mentions

### Phase 4: Polish (Weeks 7-8)
- [ ] Performance optimization
- [ ] Virtual scrolling
- [ ] Mobile responsive
- [ ] Analytics dashboard

---

## 10. Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Students | 50+ | 3 months |
| Engagement | >60% posts with comments | 6 months |
| Session duration | >8 min | 3 months |
| Thread depth | Avg 3+ levels | 6 months |
| Downloads | >80% students | 3 months |
