# SpanishConnect - Product Requirements Document

**Version:** 2.0.0  
**Last Updated:** February 2026  
**Status:** Approved for Development  
**Document Owner:** Product & Engineering Team  
**Stakeholders:** Spanish Language Instructor, Development Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Personas & Journeys](#2-user-personas--journeys)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Core Features](#4-core-features)
5. [Technical Architecture](#5-technical-architecture)
6. [Database Schemas](#6-database-schemas)
7. [API Documentation](#7-api-documentation)
8. [Comment System Deep Dive](#8-comment-system-deep-dive)
9. [UI/UX Wireframes](#9-uiux-wireframes)
10. [Performance Considerations](#10-performance-considerations)
11. [Security & Privacy](#11-security--privacy)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Checklist](#13-deployment-checklist)
14. [Timeline & Milestones](#14-timeline--milestones)
15. [Success Metrics & Analytics](#15-success-metrics--analytics)
16. [Appendices](#16-appendices)

---

## 1. Executive Summary

### 1.1 Vision Statement
SpanishConnect is a purpose-built, Facebook-inspired educational platform designed exclusively for Spanish language instruction. It bridges the gap between cluttered social media and overly complex Learning Management Systems, providing a focused, engaging environment for teacher-student interaction.

### 1.2 Problem Statement

**Current Pain Points:**
- Traditional social media platforms (Facebook, Instagram) are filled with distractions, advertisements, and non-educational content
- Existing LMS platforms (Canvas, Moodle, Blackboard) are overly complex for simple lesson sharing
- Low student engagement with passive content delivery
- High costs associated with educational technology platforms
- Lack of rich discussion features that enable meaningful back-and-forth conversations

### 1.3 Solution Overview

SpanishConnect addresses these challenges through:

| Problem | Solution |
|---------|----------|
| Social media distractions | Dedicated, ad-free educational platform |
| LMS complexity | Streamlined, intuitive Facebook-style UX |
| Low engagement | Reactions, infinite nested comments, real-time messaging |
| High costs | 100% free tier infrastructure (MongoDB Atlas, Cloudinary, Vercel) |
| Shallow discussions | Reddit-style unlimited threaded comments |

### 1.4 Technical Stack Overview

| Component | Technology | Free Tier Limits | Purpose |
|-----------|------------|------------------|---------|
| Frontend | React.js 18+ with Vite | Unlimited | Single-page application |
| Backend | Node.js/Express (Serverless) | 100GB-hrs/month, 10s timeout | API endpoints |
| Database | MongoDB Atlas M0 | 512MB storage, 100 connections | Data persistence |
| Media Storage | Cloudinary Free | 25GB storage, 25GB bandwidth/month | Images, videos, audio |
| Document Storage | MongoDB GridFS | Shared with M0 limit | PDF, DOCX, PPTX files |
| Hosting | Vercel Hobby | 100GB bandwidth/month | Frontend + serverless API |
| Authentication | JWT + httpOnly cookies | N/A | Secure session management |
| Email | Resend Free | 100 emails/day | Password reset, notifications |

### 1.5 Key Differentiators

1. **Infinite Nested Comments**: Reddit-style unlimited depth threading for rich academic discussions
2. **Role-Based Simplicity**: Only 3 roles (Teacher, Student, Guest) with clear permissions
3. **Zero Cost**: Entirely on free tiers, sustainable for individual educators
4. **Educational Focus**: No ads, no distractions, purpose-built for learning
5. **Mobile-First**: Fully responsive design for on-the-go learning

### 1.6 Project Scope

**In Scope:**
- User authentication and authorization
- Post creation with rich media support
- Infinite nested comment system
- File/document management
- Direct messaging (student-teacher only)
- Notification system
- Basic analytics dashboard

**Out of Scope (Future Phases):**
- Live video streaming integration
- Quizzes and assessments
- Grade book functionality
- Multiple teacher support
- Student-to-student messaging
- Mobile native applications
- Payment/subscription features

---

## 2. User Personas & Journeys

### 2.1 Persona 1: The Teacher (Primary Stakeholder)

**Profile:**
- **Name:** Profesora María Elena Rodríguez
- **Age:** 38
- **Role:** Spanish Language Instructor
- **Technical Proficiency:** Intermediate
- **Goals:**
  - Share lessons and materials efficiently
  - Engage students in meaningful discussions
  - Track student participation and progress
  - Build a learning community

**Pain Points:**
- Spends too much time managing multiple platforms
- Students miss content buried in social media feeds
- Difficult to facilitate structured discussions
- Expensive LMS platforms not worth the cost for small classes

**User Journey - Creating a Lesson Post:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                        │
│    ├── Opens SpanishConnect                                     │
│    ├── Enters email/password                                    │
│    └── Redirected to home feed                                  │
│                                                                 │
│ 2. CREATE POST                                                  │
│    ├── Clicks "Create Post" button                              │
│    ├── Writes lesson content in rich text editor                │
│    ├── Attaches video lesson (200MB max, auto-compressed to 20-30MB) │
│    ├── Adds 2 supporting images                                 │
│    ├── Previews post                                            │
│    └── Clicks "Post"                                            │
│                                                                 │
│ 3. ENGAGE                                                       │
│    ├── Receives notification: "Ana commented on your post"      │
│    ├── Opens post                                               │
│    ├── Reads comment thread                                     │
│    ├── Replies to student question (nested reply)               │
│    ├── Pins helpful answer to top                               │
│    └── Continues discussion                                     │
│                                                                 │
│ 4. ANALYZE                                                      │
│    ├── Opens analytics dashboard                                │
│    ├── Views engagement metrics                                 │
│    └── Identifies most active students                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Persona 2: The Active Student

**Profile:**
- **Name:** Carlos Mendez
- **Age:** 24
- **Role:** Adult learner, working professional
- **Technical Proficiency:** High
- **Goals:**
  - Learn Spanish for career advancement
  - Practice through written communication
  - Get personalized feedback from teacher
  - Access materials on mobile during commute

**Pain Points:**
- Limited time for dedicated study
- Prefers bite-sized learning content
- Wants to engage at own pace
- Needs materials accessible offline

**User Journey - Engaging with Content:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DISCOVER                                                     │
│    ├── Opens app on phone during commute                        │
│    ├── Scrolls home feed                                        │
│    ├── Sees new lesson post                                     │
│    └── Reacts with "💡 Insightful"                              │
│                                                                 │
│ 2. LEARN                                                        │
│    ├── Watches embedded video lesson                            │
│    ├── Reads through post content                               │
│    ├── Bookmarks post for later review                          │
│    └── Downloads attached PDF                                   │
│                                                                 │
│ 3. DISCUSS                                                      │
│    ├── Scrolls to comments section                              │
│    ├── Reads existing discussion                                │
│    ├── Has a question about "ser vs estar"                      │
│    ├── Replies to relevant comment thread                       │
│    ├── Gets notification: "Teacher replied to your comment"     │
│    └── Continues conversation 3 levels deep                     │
│                                                                 │
│ 4. CONNECT                                                      │
│    ├── Has private question about schedule                      │
│    ├── Opens messaging                                          │
│    ├── Sends direct message to teacher                          │
│    └── Receives response                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Persona 3: The Casual Student

**Profile:**
- **Name:** Sofia Torres
- **Age:** 19
- **Role:** University student, taking Spanish as elective
- **Technical Proficiency:** High
- **Goals:**
  - Pass the course with minimal effort
  - Access required materials
  - Complete participation requirements

**Pain Points:**
- Overwhelmed by multiple course platforms
- Forgets to check for updates
- Prefers passive consumption

**User Journey - Minimal Engagement:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ACCESS                                                       │
│    ├── Receives email notification about new post               │
│    ├── Clicks link to open post directly                        │
│    └── Views post content                                       │
│                                                                 │
│ 2. CONSUME                                                      │
│    ├── Reads required material                                  │
│    ├── Downloads files for assignment                           │
│    └── Reacts with "👍 Like" for participation credit           │
│                                                                 │
│ 3. MINIMAL INTERACTION                                          │
│    ├── Leaves brief comment if required                         │
│    └── Logs out                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Persona 4: The Prospective Student (Guest)

**Profile:**
- **Name:** James Wilson
- **Age:** 45
- **Role:** Considering learning Spanish
- **Technical Proficiency:** Low-Medium
- **Goals:**
  - Evaluate teaching style and content
  - Understand what the course offers
  - Decide whether to register

**User Journey - Evaluation:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DISCOVER                                                     │
│    ├── Finds link to SpanishConnect                             │
│    ├── Lands on public feed (no account)                        │
│    └── Browses visible content                                  │
│                                                                 │
│ 2. EVALUATE                                                     │
│    ├── Views teacher's posts                                    │
│    ├── Reads comments (collapsed by default)                    │
│    ├── Expands interesting discussions                          │
│    ├── Views Files section (no download)                        │
│    └── Views teacher profile                                    │
│                                                                 │
│ 3. CONVERT                                                      │
│    ├── Attempts to like a post                                  │
│    ├── Sees registration prompt modal                           │
│    ├── Clicks "Register"                                        │
│    ├── Creates account                                          │
│    └── Becomes active student                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. User Roles & Permissions

### 3.1 Permission Matrix Overview

| Feature | Teacher | Student | Guest |
|---------|:-------:|:-------:|:-----:|
| **Posts** |
| View posts | ✅ | ✅ | ✅ |
| Create posts | ✅ | ❌ | ❌ |
| Edit posts | ✅ (own) | ❌ | ❌ |
| Delete posts | ✅ (own) | ❌ | ❌ |
| Pin posts | ✅ (max 3) | ❌ | ❌ |
| **Reactions** |
| React to posts | ✅ | ✅ | ❌ |
| View reaction counts | ✅ | ✅ | ✅ |
| **Comments** |
| View comments | ✅ | ✅ | ✅ (collapsed) |
| Create comments | ✅ | ✅ | ❌ |
| Reply (any depth) | ✅ | ✅ | ❌ |
| Edit own comments | ✅ | ✅ (15min) | ❌ |
| Delete own comments | ✅ | ✅ | ❌ |
| Delete any comment | ✅ | ❌ | ❌ |
| Pin comment | ✅ (1/post) | ❌ | ❌ |
| Like comments | ✅ | ✅ | ❌ |
| **Files** |
| View file list | ✅ | ✅ | ✅ |
| Download files | ✅ | ✅ | ❌ |
| Upload files | ✅ | ❌ | ❌ |
| Delete files | ✅ | ❌ | ❌ |
| Create folders | ✅ | ❌ | ❌ |
| **Messaging** |
| Send messages | ✅ (to any) | ✅ (teacher only) | ❌ |
| Receive messages | ✅ | ✅ | ❌ |
| Image attachments | ✅ (5MB) | ✅ (2MB) | ❌ |
| **Profile** |
| View profiles | ✅ | ✅ | ✅ (teacher only) |
| Edit own profile | ✅ | ✅ | ❌ |
| View analytics | ✅ | ❌ | ❌ |
| **Bookmarks** |
| Bookmark posts | ✅ | ✅ | ❌ |
| View bookmarks | ✅ | ✅ | ❌ |

### 3.2 Teacher Account (Single Admin)

**Account Characteristics:**
- Single teacher account per platform instance
- Created during initial setup
- Cannot be deleted, only password reset
- Full administrative privileges

**Content Creation Capabilities:**
```
Upload Limits:
├── Images: 5MB each, max 5 per post
├── Videos: 200MB max upload, auto-compressed to 20-30MB (720p, H.264, 1.5 Mbps), max 1 per post
├── Audio: 10MB each, max 1 per post
├── Documents: 10MB each (to Files section)
└── Profile Avatar: 5MB
```

**Moderation Powers:**
- Delete any comment on any post
- Pin one comment per post (floats to top with 📌 badge)
- Highlight comments for emphasis
- View reported content (future feature)
- Access user activity logs

**Administrative Features:**
- Analytics dashboard access
- Storage usage monitoring
- User management (view all registered students)
- Export data capabilities

### 3.3 Student Account

**Account Characteristics:**
- Unlimited student registrations
- Email verification required
- Self-service password reset
- Account deactivation available

**Engagement Capabilities:**
```
Allowed Actions:
├── View all posts in chronological feed
├── React to posts (5 reaction types)
├── Comment on any post (unlimited depth)
├── Reply to any comment (unlimited depth)
├── Like comments at any level
├── Bookmark/save posts
├── Download files from Files section
├── Message teacher (text + 2MB images)
├── Edit own comments (15-minute window)
├── Delete own comments (soft delete)
└── Manage profile (avatar 2MB, display name, bio)
```

**Restrictions:**
- Cannot create posts
- Cannot message other students
- Cannot upload to Files section
- Cannot delete others' comments
- Cannot pin or highlight comments
- Cannot access analytics

### 3.4 Guest Account (Unauthenticated)

**Account Characteristics:**
- No registration required
- Limited read-only access
- Conversion-focused experience
- Registration prompts on restricted actions

**Visible Content:**
- Public feed with all posts
- Post content (text, images, videos)
- Comments (collapsed by default, expandable)
- Files list (names, sizes, folder structure)
- Teacher profile information

**Restricted Actions (Trigger Registration Modal):**
- Attempting to react to a post
- Attempting to comment
- Attempting to like a comment
- Attempting to download a file
- Attempting to message
- Attempting to bookmark

**Registration Modal Content:**
```
┌─────────────────────────────────────────────┐
│                                             │
│     🇪🇸 Join SpanishConnect                 │
│                                             │
│   Create a free account to:                 │
│   • React and comment on lessons            │
│   • Download learning materials             │
│   • Message your teacher directly           │
│   • Track your learning progress            │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │      [Register Free]                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Already have an account? [Log in]         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Core Features

### 4.1 Authentication System

#### 4.1.1 User Registration
**User Story:** As a prospective student, I want to create an account so I can participate in the learning community.

**Requirements:**
- Email/password registration form
- Email validation (format + uniqueness)
- Password requirements: minimum 8 characters, 1 uppercase, 1 number
- Username auto-generated from email (editable)
- Display name field (required)
- Email verification link sent on registration
- Account activation required before first login

**Registration Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE YOUR ACCOUNT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Email Address *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ student@example.com                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Password *                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ••••••••••••                                      👁    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ✓ 8+ characters  ✓ Uppercase  ✓ Number                       │
│                                                                 │
│  Display Name *                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Carlos Mendez                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Username                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ carlosmendez                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Used for @mentions and profile URL                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CREATE ACCOUNT                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Already have an account? [Log in]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.2 Login System
**User Story:** As a registered user, I want to securely log into my account.

**Requirements:**
- Email/password authentication
- JWT access token (15 minutes expiry)
- Refresh token (7 days expiry, stored in httpOnly cookie)
- Silent token refresh on access token expiry
- "Remember me" option extends refresh token to 30 days
- Account lockout after 5 failed attempts (15 minutes)
- Login activity logging (IP, timestamp, device)

**Token Strategy:**
```
Authentication Flow:
                                                
  ┌─────────┐     POST /auth/login      ┌─────────┐
  │ Client  │ ────────────────────────► │ Server  │
  │         │  { email, password }      │         │
  └─────────┘                           └─────────┘
       │                                     │
       │                                     ▼
       │                           ┌─────────────────┐
       │                           │ Validate creds  │
       │                           │ Generate tokens │
       │                           └─────────────────┘
       │                                     │
       │      Response:                      │
       │      - Access token (body)          │
       │      - Refresh token (httpOnly)     │
       ◄─────────────────────────────────────┘
       │
       ▼
  Store access token in memory (not localStorage)
  
  
Token Refresh Flow (automatic):

  ┌─────────┐   401 Unauthorized     ┌─────────┐
  │ Client  │ ◄───────────────────── │ Server  │
  └─────────┘                        └─────────┘
       │
       ▼
  ┌─────────┐   POST /auth/refresh   ┌─────────┐
  │ Client  │ ─────────────────────► │ Server  │
  │         │   (httpOnly cookie)    │         │
  └─────────┘                        └─────────┘
       │                                  │
       │      New access token            │
       ◄──────────────────────────────────┘
       │
       ▼
  Retry original request with new token
```

#### 4.1.3 Password Reset
**User Story:** As a user who forgot my password, I want to reset it securely.

**Requirements:**
- "Forgot password" link on login page
- Email input for reset request
- Secure reset token (expires in 1 hour)
- Reset link sent via email
- New password form with confirmation
- Invalidate all existing sessions on password change

#### 4.1.4 Session Management
**User Story:** As a security-conscious user, I want to manage my active sessions.

**Requirements:**
- View all active sessions (device, location, last active)
- "Log out all devices" option
- Automatic session cleanup on password change
- Session expiry notifications

---

### 4.2 Home Feed

#### 4.2.1 Feed Display
**User Story:** As a user, I want to see all lesson posts in a chronological feed.

**Requirements:**
- Infinite scroll pagination (10 posts per page)
- Chronological order (newest first)
- Pinned posts section at top (max 3)
- Pull-to-refresh on mobile
- Loading skeleton during fetch
- Empty state for new platforms

**Feed Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🇪🇸 SpanishConnect          [🔔 3] [✉️ 2]  [👤 Carlos ▼]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📌 PINNED POSTS                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ┌─────────────────────┐ ┌─────────────────────┐        │   │
│  │ │ Course Introduction │ │ Important: Exam Sch │        │   │
│  │ │ Welcome to Spanish..│ │ Final exam will be..│        │   │
│  │ └─────────────────────┘ └─────────────────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [👩‍🏫] Profesora María              · 2 hours ago       │   │
│  │                                                         │   │
│  │ 📚 **Lesson 5: Ser vs Estar**                          │   │
│  │                                                         │   │
│  │ Today we'll dive deep into one of the trickiest       │   │
│  │ concepts in Spanish - the difference between          │   │
│  │ "ser" and "estar". Both mean "to be" in English,     │   │
│  │ but they're used in very different contexts...        │   │
│  │                                                         │   │
│  │ ┌─────────────────────────────────────────────────┐   │   │
│  │ │                                                 │   │   │
│  │ │           [▶️ Video Thumbnail]                  │   │   │
│  │ │              15:32 duration                     │   │   │
│  │ │                                                 │   │   │
│  │ └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │ 👍 24  ❤️ 8  💡 12        💬 47 comments   🔖 15      │   │
│  │ ───────────────────────────────────────────────────── │   │
│  │ [👍 Like] [💬 Comment] [🔖 Save]                      │   │
│  │                                                         │   │
│  │ ▼ View all 47 comments                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [👩‍🏫] Profesora María              · 1 day ago         │   │
│  │ ...                                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    ⏳ Loading more posts...                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2.2 Post Creation (Teacher Only)
**User Story:** As a teacher, I want to create rich lesson posts with media attachments.

**Requirements:**
- Rich text editor with formatting:
  - Bold, italic, underline
  - Bullet and numbered lists
  - Headings (H2, H3)
  - Links with preview
  - Code blocks (for technical content)
- Media attachments with progress indicators
- Draft auto-save (localStorage)
- Preview before posting
- Schedule post for future (optional)

**Post Composer UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  CREATE NEW POST                                          [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ B  I  U  │ H1 H2 │ • ─ │ 🔗 </> │         Format ▼    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Share a lesson, announcement, or resource with         │   │
│  │ your students...                                        │   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ATTACHMENTS                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ┌──────────┐ ┌──────────┐                              │   │
│  │ │ 📷       │ │ 🎥       │  + Add more                  │   │
│  │ │ img1.jpg │ │ lesson.mp│                              │   │
│  │ │ 2.3MB ✕  │ │ 45MB ✕   │                              │   │
│  │ └──────────┘ └──────────┘                              │   │
│  │                                                         │   │
│  │ [📷 Photo] [🎥 Video] [🎵 Audio] [📎 Link to File]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ ☐ Pin this post (3 max)                                   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│           [Save Draft]  [Preview]  [📤 Post Now]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Upload Progress Indicator:**
```
┌─────────────────────────────────────────────────────────────────┐
│  UPLOADING MEDIA                                                │
│                                                                 │
│  lesson_video.mp4                                               │
│  ████████████████████░░░░░░░░░░░░░░░░░░░  45%  22MB / 48MB     │
│  Uploading to Cloudinary...                                     │
│                                                                 │
│  img_001.jpg ✓ Complete                                        │
│  img_002.jpg ✓ Complete                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2.3 Post Reactions
**User Story:** As a student, I want to react to posts to show my engagement.

**Available Reactions:**
| Emoji | Name | Use Case |
|-------|------|----------|
| 👍 | Like | General approval |
| ❤️ | Love | Really enjoyed this |
| 🎉 | Celebrate | Achievement, milestone |
| 💡 | Insightful | Learned something new |
| ❓ | Question | Have questions about this |

**Requirements:**
- Click to toggle reaction
- Only one reaction type per user per post
- Animated reaction picker on hover/long-press
- Real-time count updates (optimistic)
- View list of users who reacted

**Reaction Picker UI:**
```
                     ┌─────────────────────────────────────┐
                     │  👍   ❤️   🎉   💡   ❓            │
                     │ Like Love Cele Insi Ques           │
                     └─────────────────────────────────────┘
                                    ▲
┌─────────────────────────────────────────────────────────────────┐
│ [👍 Like] [💬 Comment] [🔖 Save]                                │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2.4 Post Bookmarking
**User Story:** As a student, I want to save posts for later review.

**Requirements:**
- Toggle bookmark with single click
- Dedicated "Saved Posts" page
- Organize saved posts by date added
- Remove from saved with confirmation
- Persist across sessions

---

### 4.3 Infinite Nested Comments System

*See Section 8 for comprehensive deep dive*

**Summary of Capabilities:**
- Unlimited nesting depth
- Visual threading with indentation
- Collapse/expand at any level
- Lazy loading pagination
- @mention support
- Teacher can pin one comment per post
- Edit within 15 minutes
- Soft delete preserves thread structure
- Deep linking to specific comments

---

### 4.4 Files & Modules Section

#### 4.4.1 File Organization
**User Story:** As a teacher, I want to organize course materials in folders.

**Folder Structure:**
```
Files & Modules
├── 📁 Beginner Lessons
│   ├── 📁 Week 1 - Greetings
│   │   ├── 📄 Vocabulary List.pdf (1.2MB) ⬇️ 45 downloads
│   │   ├── 📊 Lesson Slides.pptx (5.1MB) ⬇️ 38 downloads
│   │   └── 🎵 Pronunciation Guide.mp3 (3.4MB) ⬇️ 22 downloads
│   ├── 📁 Week 2 - Numbers
│   └── 📁 Week 3 - Colors
├── 📁 Intermediate Grammar
│   ├── 📁 Verb Conjugation
│   └── 📁 Sentence Structure
├── 📁 Practice Exercises
│   ├── 📄 Exercise Set 1.pdf
│   └── 📄 Exercise Set 2.pdf
└── 📁 Reference Materials
    ├── 📄 Spanish-English Dictionary.pdf
    └── 📄 Grammar Cheat Sheet.pdf
```

**Requirements:**
- Nested folder support (max 3 levels deep)
- Drag-and-drop file organization (teacher)
- Breadcrumb navigation
- Search within files
- Sort by name, date, size, downloads

#### 4.4.2 File Upload (Teacher)
**User Story:** As a teacher, I want to upload course materials.

**Supported Formats:**
| Type | Extensions | Max Size | Storage |
|------|------------|----------|---------|
| Documents | .pdf, .docx, .doc | 10MB | MongoDB GridFS |
| Presentations | .pptx, .ppt | 10MB | MongoDB GridFS |
| Spreadsheets | .xlsx, .xls | 10MB | MongoDB GridFS |
| Audio | .mp3, .wav | 10MB | Cloudinary |

**Upload UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  UPLOAD FILES                                              [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Upload to: 📁 Beginner Lessons / Week 1 - Greetings           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │     📁                                                  │   │
│  │                                                         │   │
│  │     Drag and drop files here                           │   │
│  │     or click to browse                                 │   │
│  │                                                         │   │
│  │     PDF, DOCX, PPTX, XLSX, MP3 (max 10MB each)        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SELECTED FILES                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 vocabulary.pdf          2.3MB    ✓ Ready            │   │
│  │ 📊 slides.pptx             8.1MB    ✓ Ready            │   │
│  │ 📄 exercises.pdf          12.4MB    ✗ Too large        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                              [Cancel]  [📤 Upload 2 Files]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.4.3 File Download (Students)
**User Story:** As a student, I want to download course materials.

**Requirements:**
- Click to download immediately
- Download counter per file
- Download history per user (for teacher analytics)
- Stream large files (don't load entire file in memory)
- Mobile: option to open in external app

---

### 4.5 Profile Management

#### 4.5.1 Profile Structure
**User Story:** As a user, I want to manage my public profile.

**Profile Fields:**
| Field | Type | Editable | Constraints |
|-------|------|----------|-------------|
| Username | String | No (once set) | Unique, URL-safe, 3-30 chars |
| Display Name | String | Yes | Required, 2-50 chars |
| Email | String | Yes (verify) | Valid email format |
| Avatar | Image | Yes | Max 2MB (student), 5MB (teacher) |
| Bio | Text | Yes | Max 500 characters |
| Role Badge | Enum | No | "Teacher" or "Student" |

**Profile Page UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]                                         [⚙️ Settings]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    COVER PHOTO AREA                        ││
│  │                                                            ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│        ┌────────┐                                              │
│        │        │                                              │
│        │ AVATAR │  Carlos Mendez                               │
│        │        │  @carlosmendez · Student                     │
│        └────────┘                                              │
│                                                                 │
│  Bio: Aspiring polyglot learning Spanish for my job.          │
│  Hoping to become fluent by end of year! 🇪🇸                   │
│                                                                 │
│  ──────────────────────────────────────────────────────────── │
│                                                                 │
│  📊 ACTIVITY STATS                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │     47       │ │    156       │ │     23       │           │
│  │   Comments   │ │  Likes Given │ │  Downloads   │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                 │
│  ──────────────────────────────────────────────────────────── │
│                                                                 │
│  📝 RECENT ACTIVITY                                            │
│  • Commented on "Lesson 5: Ser vs Estar" · 2h ago             │
│  • Downloaded "Vocabulary List Week 3.pdf" · 1d ago           │
│  • Reacted to "Course Announcement" · 2d ago                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.5.2 Avatar Upload
**Requirements:**
- Crop tool for square aspect ratio
- Preview before saving
- Automatic resizing to 400x400
- Cloudinary transformation for thumbnails (150x150)
- Default avatar for users without upload

---

### 4.6 Messaging System

#### 4.6.1 Conversation Rules
**User Story:** As a student, I want to privately message my teacher.

**Constraints:**
- Students can ONLY message the teacher
- Teacher can message any student
- No student-to-student messaging
- No group chats

#### 4.6.2 Message Features
**User Story:** As a user, I want rich messaging capabilities.

**Requirements:**
- Text messages (max 2000 characters)
- Image attachments (max 2MB for students, 5MB for teacher)
- Read receipts (double checkmark)
- Typing indicator
- Message timestamps
- Polling for new messages (30-second intervals)

**Messaging UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [←]  Profesora María                              [···]       │
│       🟢 Online                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                          ┌────────────────────┐│
│                                          │ Hi Profesora! I    ││
│                                          │ had a question     ││
│                                          │ about today's      ││
│                                          │ lesson.            ││
│                                          │          10:30 AM ✓✓││
│                                          └────────────────────┘│
│                                                                 │
│  ┌────────────────────┐                                        │
│  │ Of course Carlos!  │                                        │
│  │ What would you     │                                        │
│  │ like to know?      │                                        │
│  │ 10:32 AM           │                                        │
│  └────────────────────┘                                        │
│                                                                 │
│                                          ┌────────────────────┐│
│                                          │ When do we use     ││
│                                          │ "ser" for events   ││
│                                          │ vs "estar" for     ││
│                                          │ location?          ││
│                                          │          10:33 AM ✓✓││
│                                          └────────────────────┘│
│                                                                 │
│  ┌────────────────────┐                                        │
│  │ Great question!    │                                        │
│  │ Here's a helpful   │                                        │
│  │ diagram...         │                                        │
│  │ ┌────────────────┐ │                                        │
│  │ │   [Image]      │ │                                        │
│  │ └────────────────┘ │                                        │
│  │ 10:35 AM           │                                        │
│  └────────────────────┘                                        │
│                                                                 │
│  Profesora María is typing...                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Type a message...                         [📷] [📤]    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.6.3 Conversation List
**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  MESSAGES                                          [New Chat]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 Search conversations...                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar] Profesora María                    10:35 AM    │   │
│  │          Great question! Here's a...           (2) 🔵   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─── STUDENT VIEW (Teacher sees all students) ──────────────  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.7 Notification System

#### 4.7.1 Notification Types
| Type | Trigger | Priority |
|------|---------|----------|
| Comment Reply | Someone replies to your comment | High |
| Comment Like | Someone likes your comment | Low (batched) |
| Mention | Someone @mentions you | High |
| New Post | Teacher creates a new post | Medium |
| Pinned Comment | Your comment gets pinned | High |
| Direct Message | New message received | High |

#### 4.7.2 Notification Delivery
- **In-App**: Bell icon with unread count
- **Email**: Configurable per notification type
- **Batching**: Low-priority notifications batched hourly

#### 4.7.3 Notification Center UI
```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 NOTIFICATIONS                          [Mark all as read]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TODAY                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔵 [Avatar] Profesora María replied to your comment     │   │
│  │    "Great question! Here's a helpful explanation..."    │   │
│  │    · 5 minutes ago                      [View Comment]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔵 [Avatar] 3 people liked your comment                 │   │
│  │    on "Lesson 5: Ser vs Estar"                         │   │
│  │    · 1 hour ago                         [View Comment]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  YESTERDAY                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │    [Avatar] Ana mentioned you in a comment              │   │
│  │    "@carlosmendez did you understand this part?"       │   │
│  │    · Yesterday at 4:30 PM               [View Comment]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                     [Load Earlier]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Architecture

### 5.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │                     React.js SPA (Vite)                         │     │
│    │                                                                 │     │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │     │
│    │  │  Pages   │ │Components│ │ Contexts │ │ Services/Hooks   │  │     │
│    │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │     │
│    │                                                                 │     │
│    │  Hosted on: Vercel (CDN Edge Network)                          │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                    │                                        │
│                                    │ HTTPS                                  │
│                                    ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                              API LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │              Vercel Serverless Functions (Node.js)              │     │
│    │                                                                 │     │
│    │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │     │
│    │  │   Auth     │ │   Posts    │ │  Comments  │ │   Files    │  │     │
│    │  │   API      │ │   API      │ │    API     │ │    API     │  │     │
│    │  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │     │
│    │                                                                 │     │
│    │  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │     │
│    │  │  Messages  │ │  Notifs    │ │  Users     │                 │     │
│    │  │    API     │ │   API      │ │   API      │                 │     │
│    │  └────────────┘ └────────────┘ └────────────┘                 │     │
│    │                                                                 │     │
│    │  Max execution: 10 seconds | Memory: 1024MB                    │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                          │                    │                             │
│                          │                    │                             │
│                          ▼                    ▼                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                            DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────┐   │
│  │     MongoDB Atlas M0        │    │         Cloudinary              │   │
│  │                             │    │                                 │   │
│  │  ┌───────┐ ┌───────┐       │    │  ┌─────────┐ ┌─────────┐       │   │
│  │  │ Users │ │ Posts │       │    │  │ Avatars │ │  Post   │       │   │
│  │  └───────┘ └───────┘       │    │  │         │ │  Media  │       │   │
│  │  ┌───────┐ ┌───────┐       │    │  └─────────┘ └─────────┘       │   │
│  │  │Comment│ │Message│       │    │  ┌─────────┐ ┌─────────┐       │   │
│  │  └───────┘ └───────┘       │    │  │  Video  │ │  Audio  │       │   │
│  │  ┌───────┐ ┌───────┐       │    │  │ Streams │ │  Files  │       │   │
│  │  │Notifs │ │GridFS │       │    │  └─────────┘ └─────────┘       │   │
│  │  └───────┘ └───────┘       │    │                                 │   │
│  │                             │    │  25GB storage | 25GB bandwidth  │   │
│  │  512MB | 100 connections   │    │  25K transformations/month      │   │
│  └─────────────────────────────┘    └─────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Frontend Architecture

#### 5.2.1 Project Structure
```
src/
├── api/                          # API service layer
│   ├── axios.js                  # Configured axios instance
│   ├── auth.api.js               # Auth endpoints
│   ├── posts.api.js              # Posts endpoints
│   ├── comments.api.js           # Comments endpoints
│   ├── files.api.js              # Files endpoints
│   ├── messages.api.js           # Messages endpoints
│   └── notifications.api.js      # Notifications endpoints
│
├── components/                   # Reusable UI components
│   ├── common/                   # Generic components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Avatar/
│   │   ├── Skeleton/
│   │   └── Toast/
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── PageLayout/
│   │
│   ├── auth/                     # Auth-related components
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── ProtectedRoute/
│   │
│   ├── posts/                    # Post-related components
│   │   ├── PostCard/
│   │   ├── PostComposer/
│   │   ├── PostMedia/
│   │   ├── ReactionPicker/
│   │   └── PostList/
│   │
│   ├── comments/                 # Comment system components
│   │   ├── CommentSection/
│   │   ├── CommentThread/
│   │   ├── CommentCard/
│   │   ├── ReplyComposer/
│   │   ├── ThreadLine/
│   │   └── CommentSkeleton/
│   │
│   ├── files/                    # File management components
│   │   ├── FileExplorer/
│   │   ├── FolderTree/
│   │   ├── FileUploader/
│   │   └── FileCard/
│   │
│   ├── messages/                 # Messaging components
│   │   ├── ConversationList/
│   │   ├── ChatWindow/
│   │   ├── MessageBubble/
│   │   └── MessageComposer/
│   │
│   └── notifications/            # Notification components
│       ├── NotificationBell/
│       ├── NotificationList/
│       └── NotificationItem/
│
├── contexts/                     # React Context providers
│   ├── AuthContext.jsx           # Auth state & methods
│   ├── PostsContext.jsx          # Posts state & methods
│   ├── CommentsContext.jsx       # Comments state & methods
│   ├── NotificationsContext.jsx  # Notifications state
│   └── ThemeContext.jsx          # Theme preferences
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.js                # Auth hook
│   ├── useComments.js            # Comments hook
│   ├── usePagination.js          # Infinite scroll hook
│   ├── useDebounce.js            # Debounce hook
│   ├── useMediaQuery.js          # Responsive hook
│   └── useClickOutside.js        # Click outside hook
│
├── pages/                        # Route pages
│   ├── Home/                     # Feed page
│   ├── Post/                     # Single post page
│   ├── Files/                    # Files section
│   ├── Messages/                 # Messaging page
│   ├── Profile/                  # User profile
│   ├── Settings/                 # User settings
│   ├── Login/                    # Login page
│   ├── Register/                 # Registration page
│   └── NotFound/                 # 404 page
│
├── utils/                        # Utility functions
│   ├── formatDate.js             # Date formatting
│   ├── sanitizeHtml.js           # HTML sanitization
│   ├── validators.js             # Input validators
│   └── constants.js              # App constants
│
├── styles/                       # Global styles
│   ├── globals.css               # Global CSS
│   ├── variables.css             # CSS variables
│   └── animations.css            # Reusable animations
│
├── App.jsx                       # Root component
├── main.jsx                      # Entry point
└── router.jsx                    # Route definitions
```

#### 5.2.2 State Management Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GLOBAL STATE (React Context)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  AuthContext                                            │   │
│  │  ├── user: { _id, username, displayName, role, ... }   │   │
│  │  ├── isAuthenticated: boolean                          │   │
│  │  ├── isLoading: boolean                                │   │
│  │  ├── login(), logout(), register()                     │   │
│  │  └── refreshToken()                                    │   │
│  │                                                         │   │
│  │  NotificationsContext                                   │   │
│  │  ├── notifications: []                                  │   │
│  │  ├── unreadCount: number                               │   │
│  │  └── markAsRead(), fetchNotifications()                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  PAGE/COMPONENT STATE (React Query / SWR or useState)          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Posts: useInfiniteQuery for paginated feed            │   │
│  │  Comments: CommentsContext per post instance           │   │
│  │  Messages: useState with polling                       │   │
│  │  Files: useQuery for folder contents                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  LOCAL STATE (useState)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Form inputs, modals, dropdowns, loading states        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Backend Architecture

#### 5.3.1 API Structure
```
api/
├── index.js                      # Express app setup
├── middleware/
│   ├── auth.js                   # JWT verification
│   ├── roleCheck.js              # Role-based access
│   ├── rateLimiter.js            # Rate limiting
│   ├── errorHandler.js           # Error handling
│   └── validator.js              # Request validation
│
├── routes/
│   ├── auth.routes.js            # /api/auth/*
│   ├── posts.routes.js           # /api/posts/*
│   ├── comments.routes.js        # /api/comments/*
│   ├── files.routes.js           # /api/files/*
│   ├── messages.routes.js        # /api/messages/*
│   ├── notifications.routes.js   # /api/notifications/*
│   └── users.routes.js           # /api/users/*
│
├── controllers/
│   ├── auth.controller.js
│   ├── posts.controller.js
│   ├── comments.controller.js
│   ├── files.controller.js
│   ├── messages.controller.js
│   ├── notifications.controller.js
│   └── users.controller.js
│
├── services/
│   ├── cloudinary.service.js     # Media uploads
│   ├── email.service.js          # Email sending
│   └── notification.service.js   # Notification creation
│
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── File.js
│   ├── Message.js
│   ├── Conversation.js
│   └── Notification.js
│
└── utils/
    ├── db.js                     # MongoDB connection
    ├── jwt.js                    # Token utilities
    └── validators.js             # Validation schemas
```

#### 5.3.2 Middleware Chain
```
Request Flow:

  Incoming Request
        │
        ▼
  ┌─────────────────┐
  │  CORS Handler   │  Allow configured origins
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Rate Limiter   │  100 req/15min per IP
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Body Parser    │  JSON, max 10MB
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Cookie Parser  │  httpOnly cookies
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Auth Check     │  Verify JWT if present
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Role Check     │  Verify permissions
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Validation     │  Validate request body
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Controller     │  Business logic
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Error Handler   │  Catch & format errors
  └────────┬────────┘
           │
           ▼
      Response
```

### 5.4 Database Architecture

#### 5.4.1 MongoDB Connection Strategy
```javascript
// Serverless-optimized connection
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,           // Limit connections for free tier
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  cachedConnection = connection;
  return connection;
}
```

#### 5.4.2 Index Strategy for Performance
```javascript
// Users - Lookup optimizations
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Posts - Feed queries
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ isPinned: 1, createdAt: -1 });
db.posts.createIndex({ "author._id": 1, createdAt: -1 });

// Comments - Thread queries (CRITICAL for performance)
db.comments.createIndex({ post: 1, parentComment: 1, createdAt: -1 });
db.comments.createIndex({ post: 1, rootComment: 1, path: 1 });
db.comments.createIndex({ post: 1, depth: 1, likesCount: -1 });
db.comments.createIndex({ "author._id": 1, createdAt: -1 });
db.comments.createIndex({ post: 1, isPinned: 1 });

// Messages - Conversation queries
db.messages.createIndex({ conversation: 1, createdAt: -1 });

// Notifications - User's notifications
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, isRead: 1 });

// Files - Folder listing
db.files.createIndex({ folder: 1, createdAt: -1 });
```

### 5.5 Cloudinary Integration

#### 5.5.1 Upload Configuration
```javascript
// cloudinary.service.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload with transformations
async function uploadImage(file, options = {}) {
  const { folder, transformation } = options;
  
  return cloudinary.uploader.upload(file, {
    folder: `spanishconnect/${folder}`,
    resource_type: 'image',
    transformation: transformation || [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });
}

async function uploadVideo(file, options = {}) {
  const { folder } = options;
  
  return cloudinary.uploader.upload(file, {
    folder: `spanishconnect/${folder}`,
    resource_type: 'video',
    eager: [
      { streaming_profile: 'auto', format: 'm3u8' }  // HLS streaming
    ],
    eager_async: true
  });
}
```

#### 5.5.2 Video Compression Strategy

Videos are automatically compressed during upload using Cloudinary's transformation API:

**Compression Settings:**
- Maximum upload size: 200MB (raw video)
- Target output size: 20-30MB (compressed)
- Resolution: 720p (1280x720)
- Video codec: H.264
- Bitrate: 1.5 Mbps (optimal for educational content)
- Audio codec: AAC at 44.1kHz
- Format: MP4

**Benefits:**
- Maintains high quality for educational content (text, pronunciation, demonstrations remain clear)
- Reduces storage costs on Cloudinary
- Faster streaming for students
- No client-side processing required
- Consistent quality across all uploads

**Implementation:**
Videos are processed server-side using Cloudinary's eager transformation feature with async processing to prevent upload timeouts.

**Expected File Sizes:**
- 5-minute 200MB video → ~25MB (720p, excellent quality)
- 10-minute 100MB video → ~28MB (720p, excellent quality)
- 2-minute 50MB video → ~15MB (720p, excellent quality)

#### 5.5.3 Folder Structure
```
spanishconnect/
├── avatars/
│   └── {user_id}/
│       └── avatar.jpg
│
├── posts/
│   └── {post_id}/
│       ├── images/
│       │   ├── img_001.jpg
│       │   └── img_002.jpg
│       └── videos/
│           └── lesson.mp4
│
├── messages/
│   └── {conversation_id}/
│       └── attachments/
│           └── img_001.jpg
│
└── covers/
    └── {user_id}/
        └── cover.jpg
```

### 5.6 Security Architecture

#### 5.6.1 Authentication Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                      JWT TOKEN FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN REQUEST                                                │
│     POST /api/auth/login { email, password }                    │
│                                                                  │
│  2. SERVER VALIDATION                                            │
│     ├── Validate credentials                                    │
│     ├── Generate access token (15min, in response body)         │
│     └── Generate refresh token (7 days, httpOnly cookie)        │
│                                                                  │
│  3. CLIENT STORAGE                                               │
│     ├── Access token → Memory (NOT localStorage)                │
│     └── Refresh token → httpOnly cookie (automatic)             │
│                                                                  │
│  4. API REQUESTS                                                 │
│     Authorization: Bearer <access_token>                        │
│                                                                  │
│  5. TOKEN REFRESH (automatic on 401)                            │
│     POST /api/auth/refresh                                      │
│     ├── Server reads refresh token from cookie                  │
│     ├── Validates refresh token                                 │
│     ├── Issues new access token                                 │
│     └── Rotates refresh token (optional, security enhancement)  │
│                                                                  │
│  6. LOGOUT                                                       │
│     POST /api/auth/logout                                       │
│     ├── Clear refresh token cookie                              │
│     └── Invalidate refresh token in DB                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 5.6.2 Security Headers
```javascript
// Applied to all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' res.cloudinary.com; media-src 'self' res.cloudinary.com"
};
```

---

## 6. Database Schemas

### 6.1 Users Collection
```javascript
{
  _id: ObjectId,
  
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  
  // Profile - Immutable
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9_]{3,30}$/
  },
  
  // Profile - Mutable
  displayName: {
    type: String,
    required: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'student'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  avatarPublicId: {
    type: String,  // Cloudinary public ID for deletion
    default: null
  },
  coverUrl: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Stats (denormalized for performance)
  stats: {
    commentsCount: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 }  // Teacher only
  },
  
  // Session Management
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now },
    userAgent: String,
    ip: String
  }],
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Security
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLoginAt: Date,
  lastActiveAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ email: 1 }                    // unique
{ username: 1 }                 // unique
{ role: 1 }                     // filter by role
{ "refreshTokens.token": 1 }   // token lookup
```

### 6.2 Posts Collection
```javascript
{
  _id: ObjectId,
  
  // Author (denormalized for feed display)
  author: {
    _id: { type: ObjectId, ref: 'User', required: true },
    username: String,
    displayName: String,
    avatarUrl: String,
    role: String
  },
  
  // Content
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  contentHtml: {
    type: String,  // Pre-rendered HTML for display
    maxlength: 20000
  },
  
  // Media Attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: String,           // Cloudinary URL
    publicId: String,      // For deletion
    width: Number,
    height: Number,
    duration: Number,      // For video/audio (seconds)
    thumbnailUrl: String,  // For video
    mimeType: String
  }],
  
  // Reactions (stored as arrays for user lookup)
  reactions: {
    like: [{ type: ObjectId, ref: 'User' }],
    love: [{ type: ObjectId, ref: 'User' }],
    celebrate: [{ type: ObjectId, ref: 'User' }],
    insightful: [{ type: ObjectId, ref: 'User' }],
    question: [{ type: ObjectId, ref: 'User' }]
  },
  
  // Reaction counts (denormalized for display)
  reactionsCount: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    celebrate: { type: Number, default: 0 },
    insightful: { type: Number, default: 0 },
    question: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // Engagement
  commentsCount: { type: Number, default: 0 },
  bookmarkedBy: [{ type: ObjectId, ref: 'User' }],
  bookmarksCount: { type: Number, default: 0 },
  
  // Status
  isPinned: { type: Boolean, default: false },
  pinnedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ createdAt: -1 }                                    // Feed (newest first)
{ isPinned: -1, createdAt: -1 }                     // Pinned posts first
{ "author._id": 1, createdAt: -1 }                  // User's posts
{ isDeleted: 1, createdAt: -1 }                     // Filter deleted
{ "bookmarkedBy": 1 }                               // User's bookmarks
```

### 6.3 Comments Collection (Critical for Nested Threading)
```javascript
{
  _id: ObjectId,
  
  // Post Reference
  post: {
    type: ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  
  // Author (denormalized)
  author: {
    _id: { type: ObjectId, ref: 'User', required: true },
    username: String,
    displayName: String,
    avatarUrl: String,
    role: String  // 'teacher' or 'student'
  },
  
  // Threading - Hybrid Approach
  parentComment: {
    type: ObjectId,
    ref: 'Comment',
    default: null,     // null for root comments
    index: true
  },
  rootComment: {
    type: ObjectId,
    ref: 'Comment',
    default: null,     // null for root comments, otherwise points to thread root
    index: true
  },
  path: {
    type: String,
    default: '',       // Materialized path: "rootId/parentId/thisId"
    index: true
  },
  depth: {
    type: Number,
    default: 0,        // 0 for root, +1 for each level
    index: true
  },
  
  // Content
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  mentions: [{
    type: String       // @usernames mentioned
  }],
  
  // Engagement
  likes: [{
    type: ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0,
    index: true        // For sorting by popularity
  },
  
  // Reply counts
  repliesCount: {
    type: Number,
    default: 0         // Direct replies only
  },
  totalRepliesCount: {
    type: Number,
    default: 0         // All nested replies (recursive)
  },
  
  // Status Flags
  isPinned: {
    type: Boolean,
    default: false     // Only one pinned per post
  },
  isHighlighted: {
    type: Boolean,
    default: false     // Teacher can highlight
  },
  isDeleted: {
    type: Boolean,
    default: false     // Soft delete
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  editedAt: Date,
  deletedAt: Date
}

// Compound Indexes for Performance
{ post: 1, parentComment: 1, createdAt: -1 }    // Root comments for a post
{ post: 1, rootComment: 1, path: 1 }            // Thread fetching
{ post: 1, depth: 1, likesCount: -1 }           // Sort by popularity per depth
{ post: 1, isPinned: -1, createdAt: -1 }        // Pinned comment first
{ "author._id": 1, createdAt: -1 }              // User's comments
{ post: 1, createdAt: -1 }                      // Simple chronological
```

### 6.4 Files Collection
```javascript
{
  _id: ObjectId,
  
  // File Metadata
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true     // In bytes
  },
  extension: String,
  
  // Storage
  storageType: {
    type: String,
    enum: ['gridfs', 'cloudinary'],
    required: true
  },
  gridfsId: ObjectId,         // If stored in GridFS
  cloudinaryUrl: String,      // If stored in Cloudinary
  cloudinaryPublicId: String,
  
  // Organization
  folder: {
    type: ObjectId,
    ref: 'Folder',
    default: null       // null = root
  },
  
  // Upload Info
  uploadedBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  // Stats
  downloadsCount: { type: Number, default: 0 },
  downloadedBy: [{
    user: { type: ObjectId, ref: 'User' },
    downloadedAt: { type: Date, default: Date.now }
  }],
  
  // Status
  isDeleted: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ folder: 1, createdAt: -1 }
{ uploadedBy: 1 }
{ filename: 'text' }            // Text search
```

### 6.5 Folders Collection
```javascript
{
  _id: ObjectId,
  
  name: {
    type: String,
    required: true
  },
  parentFolder: {
    type: ObjectId,
    ref: 'Folder',
    default: null       // null = root
  },
  path: String,         // "/parent/child/this"
  depth: {
    type: Number,
    default: 0,
    max: 3              // Max 3 levels deep
  },
  
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  filesCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ parentFolder: 1, name: 1 }
{ path: 1 }
```

### 6.6 Conversations Collection
```javascript
{
  _id: ObjectId,
  
  participants: [{
    type: ObjectId,
    ref: 'User'
  }],
  
  // Always teacher + one student
  teacher: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  // Last message preview
  lastMessage: {
    content: String,
    sender: ObjectId,
    createdAt: Date
  },
  
  // Unread counts per participant
  unreadCount: {
    type: Map,
    of: Number,
    default: {}         // { "userId": count }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ participants: 1 }
{ teacher: 1, student: 1 }      // unique pair
{ updatedAt: -1 }               // Sort by recent
```

### 6.7 Messages Collection
```javascript
{
  _id: ObjectId,
  
  conversation: {
    type: ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  sender: {
    _id: { type: ObjectId, ref: 'User', required: true },
    username: String,
    displayName: String,
    avatarUrl: String
  },
  
  content: {
    type: String,
    maxlength: 2000
  },
  
  attachments: [{
    type: {
      type: String,
      enum: ['image']
    },
    url: String,
    publicId: String,
    width: Number,
    height: Number
  }],
  
  // Read status
  readAt: Date,
  readBy: {
    type: ObjectId,
    ref: 'User'
  },
  
  isDeleted: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
}

// Indexes
{ conversation: 1, createdAt: -1 }
{ "sender._id": 1 }
```

### 6.8 Notifications Collection
```javascript
{
  _id: ObjectId,
  
  recipient: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'comment_reply',      // Someone replied to your comment
      'comment_like',       // Someone liked your comment
      'comment_mention',    // Someone mentioned you
      'post_comment',       // Someone commented on your post (teacher)
      'comment_pinned',     // Your comment was pinned
      'new_post',           // New post from teacher
      'new_message'         // New direct message
    ],
    required: true
  },
  
  // Actor (who triggered the notification)
  actor: {
    _id: { type: ObjectId, ref: 'User' },
    username: String,
    displayName: String,
    avatarUrl: String
  },
  
  // Reference to related content
  reference: {
    type: {
      type: String,
      enum: ['post', 'comment', 'message']
    },
    id: ObjectId,
    preview: String,        // Truncated content preview
    postId: ObjectId        // For comment references, include post
  },
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // For batching (e.g., "3 people liked your comment")
  batchCount: { type: Number, default: 1 },
  batchActors: [{
    _id: ObjectId,
    username: String,
    displayName: String,
    avatarUrl: String
  }],
  
  createdAt: { type: Date, default: Date.now }
}

// Indexes
{ recipient: 1, createdAt: -1 }
{ recipient: 1, isRead: 1 }
{ recipient: 1, type: 1, createdAt: -1 }
// TTL index to auto-delete old notifications (optional)
{ createdAt: 1 }, { expireAfterSeconds: 7776000 }  // 90 days
```

### 6.9 Storage Budget Analysis

| Collection | Avg Doc Size | Est. Count | Total Size |
|------------|--------------|------------|------------|
| Users | 1.5 KB | 100 | 150 KB |
| Posts | 3 KB | 500 | 1.5 MB |
| **Comments** | 600 bytes | 15,000 | **9 MB** |
| Conversations | 500 bytes | 100 | 50 KB |
| Messages | 400 bytes | 5,000 | 2 MB |
| Files (metadata) | 600 bytes | 200 | 120 KB |
| Folders | 200 bytes | 50 | 10 KB |
| Notifications | 300 bytes | 20,000 | 6 MB |
| **GridFS (documents)** | varies | 200 files | **~350 MB** |
| **Indexes** | - | - | **~30 MB** |
| **Total** | | | **~400 MB** |

**Headroom**: ~110 MB remaining from 512 MB limit

**Growth Projections:**
- Comments can grow to ~25,000 before optimization needed
- Consider archiving old notifications after 90 days
- GridFS files are the largest consumer - monitor closely

---

## 7. API Documentation

### 7.1 Base Configuration

**Base URL:** `https://spanishconnect.vercel.app/api`

**Authentication:**
- Bearer token in `Authorization` header
- Refresh token in `httpOnly` cookie

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasMore": true
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 7.2 Authentication Endpoints

#### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "displayName": "Carlos Mendez",
  "username": "carlosmendez"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@example.com",
      "username": "carlosmendez",
      "displayName": "Carlos Mendez",
      "role": "student"
    },
    "message": "Verification email sent"
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Email/username already exists

---

#### POST /api/auth/login
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@example.com",
      "username": "carlosmendez",
      "displayName": "Carlos Mendez",
      "role": "student",
      "avatarUrl": "https://res.cloudinary.com/..."
    }
  }
}
```
*Refresh token set in httpOnly cookie*

**Errors:**
- `401` - Invalid credentials
- `403` - Account locked
- `403` - Email not verified

---

#### POST /api/auth/refresh
Refresh access token using refresh token cookie.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `401` - Invalid/expired refresh token

---

#### POST /api/auth/logout
Log out and invalidate refresh token.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "student@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If email exists, reset link sent"
}
```

---

#### POST /api/auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 7.3 Posts Endpoints

#### GET /api/posts
Get paginated list of posts.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Posts per page (max 50) |
| pinned | boolean | - | Filter pinned posts only |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "author": {
          "_id": "...",
          "username": "profesora",
          "displayName": "Profesora María",
          "avatarUrl": "...",
          "role": "teacher"
        },
        "content": "# Lesson 5: Ser vs Estar...",
        "contentHtml": "<h1>Lesson 5: Ser vs Estar</h1>...",
        "media": [
          {
            "type": "video",
            "url": "https://res.cloudinary.com/...",
            "thumbnailUrl": "...",
            "duration": 932
          }
        ],
        "reactionsCount": {
          "like": 24,
          "love": 8,
          "insightful": 12,
          "total": 44
        },
        "userReaction": "like",
        "commentsCount": 47,
        "isBookmarked": true,
        "isPinned": false,
        "createdAt": "2026-02-01T10:30:00.000Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasMore": true
  }
}
```

---

#### POST /api/posts
Create a new post (Teacher only).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart):**
```
content: "# Today's Lesson..."
isPinned: false
images: [file1, file2, ...]
video: [file]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "post": { ... }
  }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not teacher)
- `400` - Validation error
- `413` - File too large

---

#### GET /api/posts/:postId
Get single post with full details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "_id": "...",
      "author": { ... },
      "content": "...",
      "media": [ ... ],
      "reactions": {
        "like": ["userId1", "userId2", ...],
        "love": [...],
        ...
      },
      "reactionsCount": { ... },
      "userReaction": "like",
      "commentsCount": 47,
      "isBookmarked": false,
      "isPinned": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

#### PUT /api/posts/:postId
Update a post (Teacher only).

**Request:**
```json
{
  "content": "Updated content...",
  "isPinned": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post": { ... }
  }
}
```

---

#### DELETE /api/posts/:postId
Soft delete a post (Teacher only).

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted"
}
```

---

#### POST /api/posts/:postId/reactions
Toggle reaction on a post.

**Request:**
```json
{
  "type": "like"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reacted": true,
    "type": "like",
    "reactionsCount": {
      "like": 25,
      "total": 45
    }
  }
}
```

---

#### POST /api/posts/:postId/bookmark
Toggle bookmark on a post.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookmarked": true
  }
}
```

---

### 7.4 Comments Endpoints

#### GET /api/posts/:postId/comments
Get root-level comments for a post.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Comments per page (max 50) |
| sort | string | "newest" | "newest", "oldest", "popular", "discussed" |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "comment123",
        "post": "post456",
        "author": {
          "_id": "user789",
          "username": "maria_garcia",
          "displayName": "María García",
          "avatarUrl": "...",
          "role": "student"
        },
        "content": "This lesson was very helpful!",
        "depth": 0,
        "likesCount": 5,
        "repliesCount": 12,
        "hasMoreReplies": true,
        "replies": [
          {
            "_id": "reply001",
            "author": { ... },
            "content": "¡Excelente María!",
            "depth": 1,
            "likesCount": 3,
            "repliesCount": 5,
            "replies": [],
            "hasMoreReplies": true,
            "isPinned": true,
            ...
          },
          {
            "_id": "reply002",
            ...
          },
          {
            "_id": "reply003",
            ...
          }
        ],
        "isLiked": false,
        "isPinned": false,
        "isEdited": false,
        "createdAt": "2026-02-01T12:30:00.000Z"
      }
    ],
    "pinnedComment": {
      "_id": "pinnedComment123",
      ...
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5,
    "hasMore": true
  }
}
```

---

#### POST /api/posts/:postId/comments
Create a new comment.

**Request:**
```json
{
  "content": "This is my comment @profesora",
  "parentCommentId": null
}
```

*For replies, include `parentCommentId`*

**Response (201):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "newComment123",
      "post": "post456",
      "author": { ... },
      "parentComment": null,
      "rootComment": null,
      "path": "newComment123",
      "depth": 0,
      "content": "This is my comment @profesora",
      "mentions": ["profesora"],
      "likesCount": 0,
      "repliesCount": 0,
      "isPinned": false,
      "isDeleted": false,
      "isEdited": false,
      "createdAt": "..."
    }
  }
}
```

---

#### GET /api/comments/:commentId
Get single comment with parent chain (for deep linking).

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| context | boolean | true | Include parent chain |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "deepComment123",
      "content": "...",
      "depth": 4,
      ...
    },
    "parentChain": [
      { "_id": "root...", "depth": 0, "content": "..." },
      { "_id": "level1...", "depth": 1, "content": "..." },
      { "_id": "level2...", "depth": 2, "content": "..." },
      { "_id": "level3...", "depth": 3, "content": "..." }
    ],
    "replies": [
      { ... }
    ],
    "post": {
      "_id": "post456",
      "content": "Post preview..."
    }
  }
}
```

---

#### GET /api/comments/:commentId/replies
Get replies to a specific comment.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 5 | Replies per page (max 20) |
| sort | string | "newest" | "newest", "oldest", "popular" |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "replies": [
      {
        "_id": "reply001",
        "content": "...",
        "depth": 2,
        "repliesCount": 3,
        "hasMoreReplies": true,
        ...
      }
    ],
    "parentComment": {
      "_id": "parent123",
      "content": "...",
      "author": { ... }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "hasMore": true
  }
}
```

---

#### PUT /api/comments/:commentId
Edit a comment (owner only, within 15 minutes).

**Request:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "comment123",
      "content": "Updated comment text",
      "isEdited": true,
      "editedAt": "2026-02-01T12:45:00.000Z",
      ...
    }
  }
}
```

**Errors:**
- `403` - Edit window expired (15 minutes)
- `403` - Not comment owner

---

#### DELETE /api/comments/:commentId
Soft delete a comment.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "comment123",
      "isDeleted": true,
      "content": "[Comment deleted]",
      "deletedAt": "..."
    }
  }
}
```

---

#### POST /api/comments/:commentId/like
Toggle like on a comment.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 6
  }
}
```

---

#### POST /api/comments/:commentId/pin
Pin a comment (Teacher only, one per post).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "comment123",
      "isPinned": true
    },
    "previouslyPinned": {
      "_id": "oldPinned456",
      "isPinned": false
    }
  }
}
```

---

### 7.5 Files Endpoints

#### GET /api/files
List files and folders.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| folderId | string | null | Folder ID (null = root) |
| sort | string | "name" | "name", "date", "size", "downloads" |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentFolder": {
      "_id": "folder123",
      "name": "Beginner Lessons",
      "path": "/Beginner Lessons"
    },
    "breadcrumbs": [
      { "_id": null, "name": "Files" },
      { "_id": "folder123", "name": "Beginner Lessons" }
    ],
    "folders": [
      {
        "_id": "subfolder456",
        "name": "Week 1 - Greetings",
        "filesCount": 5
      }
    ],
    "files": [
      {
        "_id": "file789",
        "filename": "vocabulary.pdf",
        "originalName": "Spanish Vocabulary List.pdf",
        "mimeType": "application/pdf",
        "size": 2456789,
        "downloadsCount": 45,
        "createdAt": "..."
      }
    ]
  }
}
```

---

#### POST /api/files
Upload a file (Teacher only).

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [File]
folderId: "folder123" (optional)
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "file": {
      "_id": "newFile123",
      "filename": "...",
      "size": 5242880,
      ...
    }
  }
}
```

---

#### GET /api/files/:fileId
Download a file.

**Response:**
Binary file stream with appropriate headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="vocabulary.pdf"
```

---

#### DELETE /api/files/:fileId
Delete a file (Teacher only).

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted"
}
```

---

### 7.6 Messages Endpoints

#### GET /api/messages
Get all conversations.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "conv123",
        "participant": {
          "_id": "user456",
          "username": "carlosmendez",
          "displayName": "Carlos Mendez",
          "avatarUrl": "..."
        },
        "lastMessage": {
          "content": "Great question! Here's...",
          "sender": "teacher_id",
          "createdAt": "..."
        },
        "unreadCount": 2,
        "updatedAt": "..."
      }
    ]
  }
}
```

---

#### GET /api/messages/:conversationId
Get messages in a conversation.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 30 | Messages per page |
| before | string | - | Cursor for older messages |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "_id": "conv123",
      "participant": { ... }
    },
    "messages": [
      {
        "_id": "msg001",
        "sender": { ... },
        "content": "Hi Profesora!",
        "attachments": [],
        "readAt": "...",
        "createdAt": "..."
      }
    ]
  },
  "pagination": {
    "hasMore": true,
    "nextCursor": "..."
  }
}
```

---

#### POST /api/messages
Send a message.

**Request:**
```json
{
  "recipientId": "teacher_id",
  "content": "Quick question about today's lesson..."
}
```

*Or with attachment (multipart):*
```
recipientId: "teacher_id"
content: "See this image"
image: [File]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "newMsg123",
      "conversation": "conv123",
      "sender": { ... },
      "content": "...",
      "createdAt": "..."
    }
  }
}
```

---

### 7.7 Notifications Endpoints

#### GET /api/notifications
Get user's notifications.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Notifications per page |
| unreadOnly | boolean | false | Filter unread only |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notif123",
        "type": "comment_reply",
        "actor": {
          "_id": "...",
          "displayName": "Profesora María",
          "avatarUrl": "..."
        },
        "reference": {
          "type": "comment",
          "id": "comment456",
          "preview": "Great question! Here's...",
          "postId": "post789"
        },
        "isRead": false,
        "createdAt": "..."
      }
    ],
    "unreadCount": 5
  },
  "pagination": { ... }
}
```

---

#### POST /api/notifications/read
Mark notifications as read.

**Request:**
```json
{
  "notificationIds": ["notif123", "notif456"],
  "all": false
}
```

*Set `all: true` to mark all as read*

**Response (200):**
```json
{
  "success": true,
  "data": {
    "markedCount": 2
  }
}
```

---

### 7.8 Users Endpoints

#### GET /api/users/:username
Get user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "carlosmendez",
      "displayName": "Carlos Mendez",
      "role": "student",
      "avatarUrl": "...",
      "bio": "Learning Spanish for my job!",
      "stats": {
        "commentsCount": 47,
        "likesGiven": 156,
        "downloadsCount": 23
      },
      "createdAt": "..."
    }
  }
}
```

---

#### PUT /api/users/me
Update current user's profile.

**Request (multipart for avatar):**
```
displayName: "Carlos M."
bio: "Updated bio..."
avatar: [File]
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

### 7.9 Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Posts (read) | 100 requests | 15 minutes |
| Posts (write) | 20 requests | 15 minutes |
| Comments | 30 requests | 15 minutes |
| Reactions/Likes | 60 requests | 15 minutes |
| Messages | 50 requests | 15 minutes |
| File downloads | 50 requests | 15 minutes |

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 300
  }
}
```

---

## 8. Comment System Deep Dive

### 8.1 Threading Algorithm

#### 8.1.1 Data Structure Choice: Hybrid Approach

The comment system uses a hybrid of three threading patterns for optimal flexibility and performance:

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID THREADING MODEL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ADJACENCY LIST (parentComment)                              │
│     ├── Simple parent reference                                │
│     ├── Easy to query direct replies                           │
│     └── O(1) to find parent                                    │
│                                                                 │
│  2. ROOT REFERENCE (rootComment)                                │
│     ├── Points to thread root                                  │
│     ├── Quick access to entire thread                          │
│     └── Efficient for "view full thread" queries               │
│                                                                 │
│  3. MATERIALIZED PATH (path)                                    │
│     ├── Full ancestry path: "rootId/parentId/thisId"           │
│     ├── Enables subtree queries with regex                     │
│     └── Preserves ordering information                         │
│                                                                 │
│  4. DEPTH TRACKING (depth)                                      │
│     ├── Numeric nesting level                                  │
│     ├── Quick depth checks without parsing                     │
│     └── Enables depth-based rendering rules                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 8.1.2 Comment Creation Algorithm

```javascript
async function createComment(postId, userId, content, parentCommentId = null) {
  // 1. Validate input
  validateContent(content);  // Length, sanitization
  
  // 2. Extract @mentions
  const mentions = extractMentions(content);
  
  // 3. Calculate threading fields
  let depth = 0;
  let path = '';
  let rootComment = null;
  let parentComment = null;
  
  if (parentCommentId) {
    // Fetch parent comment
    parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) throw new Error('Parent comment not found');
    if (parentComment.post.toString() !== postId) {
      throw new Error('Parent comment belongs to different post');
    }
    
    // Calculate depth
    depth = parentComment.depth + 1;
    
    // Set root comment (parent's root, or parent itself if parent is root)
    rootComment = parentComment.rootComment || parentComment._id;
    
    // Build path (will be completed after saving)
    // Path format: "rootId/level1Id/level2Id/.../thisId"
  }
  
  // 4. Create comment
  const newComment = await Comment.create({
    post: postId,
    author: {
      _id: userId,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role
    },
    content: sanitizeHtml(content),
    mentions,
    parentComment: parentCommentId,
    rootComment,
    depth,
    path: '', // Temporary, updated below
    likesCount: 0,
    repliesCount: 0,
    totalRepliesCount: 0
  });
  
  // 5. Update path with new ID
  const pathParts = parentComment ? parentComment.path.split('/') : [];
  pathParts.push(newComment._id.toString());
  newComment.path = pathParts.join('/');
  await newComment.save();
  
  // 6. Update parent's reply count
  if (parentComment) {
    await Comment.updateOne(
      { _id: parentCommentId },
      { $inc: { repliesCount: 1 } }
    );
    
    // Update all ancestors' totalRepliesCount
    await Comment.updateMany(
      { _id: { $in: pathParts.slice(0, -1).map(id => new ObjectId(id)) } },
      { $inc: { totalRepliesCount: 1 } }
    );
  }
  
  // 7. Update post's comment count
  await Post.updateOne(
    { _id: postId },
    { $inc: { commentsCount: 1 } }
  );
  
  // 8. Create notifications
  await createCommentNotifications(newComment, mentions, parentComment);
  
  return newComment;
}
```

#### 8.1.3 Comment Fetching Strategies

**Fetching Root Comments:**
```javascript
async function getRootComments(postId, { page = 1, limit = 10, sort = 'newest' }) {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likesCount: -1, createdAt: -1 },
    discussed: { repliesCount: -1, createdAt: -1 }
  };
  
  // Get pinned comment first (if exists)
  const pinnedComment = await Comment.findOne({
    post: postId,
    isPinned: true
  }).lean();
  
  // Get paginated root comments
  const comments = await Comment.find({
    post: postId,
    parentComment: null,
    isDeleted: false,
    _id: { $ne: pinnedComment?._id }  // Exclude pinned from pagination
  })
  .sort(sortOptions[sort])
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
  
  // For each root comment, fetch first 3 replies
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({
        parentComment: comment._id
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
      
      return {
        ...comment,
        replies,
        hasMoreReplies: comment.repliesCount > 3
      };
    })
  );
  
  const total = await Comment.countDocuments({
    post: postId,
    parentComment: null,
    isDeleted: false
  });
  
  return {
    pinnedComment,
    comments: commentsWithReplies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}
```

**Fetching Replies (Any Level):**
```javascript
async function getReplies(commentId, { page = 1, limit = 5, sort = 'newest' }) {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likesCount: -1 }
  };
  
  const replies = await Comment.find({
    parentComment: commentId
  })
  .sort(sortOptions[sort])
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
  
  const total = await Comment.countDocuments({
    parentComment: commentId
  });
  
  return {
    replies,
    pagination: {
      page,
      limit,
      total,
      hasMore: page * limit < total
    }
  };
}
```

**Fetching Comment with Full Context (Deep Link):**
```javascript
async function getCommentWithContext(commentId) {
  const comment = await Comment.findById(commentId).lean();
  if (!comment) throw new Error('Comment not found');
  
  // Parse path to get all ancestor IDs
  const ancestorIds = comment.path.split('/').slice(0, -1);
  
  // Fetch all ancestors in order
  const ancestors = await Comment.find({
    _id: { $in: ancestorIds.map(id => new ObjectId(id)) }
  }).lean();
  
  // Sort ancestors by depth
  const parentChain = ancestors.sort((a, b) => a.depth - b.depth);
  
  // Fetch first few replies
  const replies = await Comment.find({
    parentComment: commentId
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();
  
  // Fetch post preview
  const post = await Post.findById(comment.post)
    .select('_id content author createdAt')
    .lean();
  
  return {
    comment,
    parentChain,
    replies,
    post: {
      _id: post._id,
      preview: post.content.substring(0, 200),
      author: post.author
    }
  };
}
```

### 8.2 Edge Cases & Solutions

#### 8.2.1 Deleted Parent with Existing Replies

**Scenario:** A comment with replies is deleted.

**Solution:** Soft delete preserves thread structure.

```
BEFORE DELETE:
├── María: "Great lesson!"
│   ├── Teacher: "Thank you!"  ← TO BE DELETED
│   │   ├── Carlos: "I agree!"
│   │   └── Ana: "Me too!"
│   └── Juan: "Helpful!"

AFTER DELETE:
├── María: "Great lesson!"
│   ├── [Comment deleted]      ← Shows placeholder
│   │   ├── Carlos: "I agree!" ← Replies preserved
│   │   └── Ana: "Me too!"
│   └── Juan: "Helpful!"
```

**Implementation:**
```javascript
async function deleteComment(commentId, userId) {
  const comment = await Comment.findById(commentId);
  
  // Check authorization
  if (comment.author._id.toString() !== userId && user.role !== 'teacher') {
    throw new Error('Not authorized to delete this comment');
  }
  
  // Soft delete - preserve structure
  comment.isDeleted = true;
  comment.deletedAt = new Date();
  comment.content = '[Comment deleted]';  // Clear content for privacy
  
  // Preserve threading fields (parentComment, path, depth, etc.)
  // Preserve repliesCount for UI
  
  await comment.save();
  
  // Note: Do NOT decrement parent's repliesCount or post's commentsCount
  // This preserves thread integrity
  
  return comment;
}
```

**Display Logic:**
```javascript
function CommentCard({ comment }) {
  if (comment.isDeleted) {
    return (
      <div className="deleted-comment">
        <span className="deleted-text">[Comment deleted]</span>
        {comment.repliesCount > 0 && (
          <span className="replies-note">
            · {comment.repliesCount} replies
          </span>
        )}
      </div>
    );
  }
  
  // Normal comment rendering...
}
```

#### 8.2.2 Deep Linking to Deeply Nested Comments

**Scenario:** User clicks a notification link to a comment that's 10 levels deep.

**Solution:** Fetch and display parent chain, expand all ancestors.

```
URL: /post/abc123#comment-xyz789

BEHAVIOR:
1. Fetch comment xyz789 with context
2. Receive: comment + parentChain[] + replies[]
3. Render parent chain as collapsed previews
4. Expand and scroll to target comment
5. Highlight target comment briefly

UI RESULT:
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ [Collapsed] Root comment by María...                        │
│ │  └─ [Collapsed] Reply by Teacher...                          │
│ │     └─ [Collapsed] Reply by Carlos...                        │
│ │        └─ [Collapsed] Reply by Ana...                        │
│ │           └─ ┌─────────────────────────────────────────┐     │
│ │              │ 🔍 TARGET COMMENT (highlighted)          │     │
│ │              │ Juan: This is the deep comment           │     │
│ │              │ you were looking for!                    │     │
│ │              └─────────────────────────────────────────┘     │
│ │              └─ [Reply 1]                                    │
│ │              └─ [Reply 2]                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function DeepLinkedComment({ commentId }) {
  const [data, setData] = useState(null);
  const targetRef = useRef(null);
  
  useEffect(() => {
    async function load() {
      const result = await api.getCommentWithContext(commentId);
      setData(result);
    }
    load();
  }, [commentId]);
  
  useEffect(() => {
    if (data && targetRef.current) {
      // Scroll to target
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Highlight briefly
      targetRef.current.classList.add('highlight-pulse');
      setTimeout(() => {
        targetRef.current.classList.remove('highlight-pulse');
      }, 3000);
    }
  }, [data]);
  
  if (!data) return <LoadingSkeleton />;
  
  return (
    <div className="deep-linked-thread">
      {/* Collapsed parent chain */}
      {data.parentChain.map((ancestor, index) => (
        <CollapsedCommentPreview 
          key={ancestor._id}
          comment={ancestor}
          depth={index}
          isExpandable={true}
        />
      ))}
      
      {/* Target comment - highlighted */}
      <div ref={targetRef} className="target-comment">
        <CommentCard 
          comment={data.comment}
          depth={data.comment.depth}
          isHighlighted={true}
        />
      </div>
      
      {/* Replies to target */}
      {data.replies.map(reply => (
        <CommentThread 
          key={reply._id}
          comment={reply}
          depth={data.comment.depth + 1}
        />
      ))}
    </div>
  );
}
```

#### 8.2.3 Mobile Deep Nesting Display

**Scenario:** Comment thread 10+ levels deep on a narrow mobile screen.

**Solution:** Cap visual indentation, use "Continue thread" links.

```
MOBILE DISPLAY (max indent at level 3):

│ Level 0 comment
│ └─ Level 1 comment
│    └─ Level 2 comment
│       └─ Level 3+ (max indent)
│          "Thread continues... →"
│          Click to open in focused view
```

**Implementation:**
```javascript
function CommentThread({ comment, depth = 0 }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Indent caps
  const maxDesktopDepth = 5;
  const maxMobileDepth = 3;
  const maxDepth = isMobile ? maxMobileDepth : maxDesktopDepth;
  
  // Indentation calculation
  const indentPx = isMobile ? 24 : 40;
  const visualDepth = Math.min(depth, maxDepth);
  const marginLeft = visualDepth * indentPx;
  
  // Show "continue thread" link for deeply nested on mobile
  const showContinueThread = isMobile && depth >= maxMobileDepth && comment.repliesCount > 0;
  
  return (
    <div 
      className="comment-thread"
      style={{ marginLeft }}
    >
      <CommentCard comment={comment} />
      
      {showContinueThread ? (
        <Link 
          to={`/post/${comment.post}#comment-${comment._id}?thread=true`}
          className="continue-thread-link"
        >
          Continue this thread →
        </Link>
      ) : (
        comment.replies?.map(reply => (
          <CommentThread 
            key={reply._id}
            comment={reply}
            depth={depth + 1}
          />
        ))
      )}
    </div>
  );
}
```

#### 8.2.4 Comment Rate Limiting

**Scenario:** Prevent spam and abuse.

**Solution:** Rate limit comment creation per user.

```javascript
// Rate limit: 10 comments per minute per user
const commentRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  keyGenerator: (req) => req.user._id.toString(),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many comments. Please wait before posting again.',
      retryAfter: 60
    }
  }
});

// Apply to comment creation
router.post('/posts/:postId/comments', 
  authenticate, 
  commentRateLimiter, 
  createCommentHandler
);
```

### 8.3 Accessibility Implementation

#### 8.3.1 Keyboard Navigation

```javascript
function CommentSection({ postId }) {
  const [focusedCommentId, setFocusedCommentId] = useState(null);
  
  const handleKeyDown = (e, commentId, depth) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusNextComment(commentId);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPreviousComment(commentId);
        break;
      case 'ArrowRight':
        e.preventDefault();
        expandReplies(commentId);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        collapseReplies(commentId);
        break;
      case 'Enter':
        if (e.shiftKey) {
          openReplyComposer(commentId);
        }
        break;
      case 'l':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          toggleLike(commentId);
        }
        break;
    }
  };
  
  return (
    <div 
      role="tree"
      aria-label="Comment thread"
      className="comment-section"
    >
      {comments.map(comment => (
        <CommentTreeItem
          key={comment._id}
          comment={comment}
          onKeyDown={handleKeyDown}
          isFocused={focusedCommentId === comment._id}
        />
      ))}
    </div>
  );
}

function CommentTreeItem({ comment, depth, onKeyDown, isFocused }) {
  return (
    <div
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={showReplies}
      aria-selected={isFocused}
      tabIndex={isFocused ? 0 : -1}
      onKeyDown={(e) => onKeyDown(e, comment._id, depth)}
    >
      <CommentCard comment={comment} />
      
      {showReplies && (
        <div role="group" aria-label={`Replies to ${comment.author.displayName}`}>
          {comment.replies.map(reply => (
            <CommentTreeItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              {...props}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 8.3.2 Screen Reader Announcements

```javascript
function CommentCard({ comment }) {
  return (
    <article 
      aria-label={`Comment by ${comment.author.displayName}`}
      className="comment-card"
    >
      {/* Hidden context for screen readers */}
      <span className="sr-only">
        {comment.isPinned && 'Pinned comment. '}
        {comment.author.role === 'teacher' && 'Teacher comment. '}
        Posted {formatRelativeTime(comment.createdAt)}.
        {comment.likesCount > 0 && ` ${comment.likesCount} likes.`}
        {comment.repliesCount > 0 && ` ${comment.repliesCount} replies.`}
      </span>
      
      {/* Visible content */}
      <header>
        <Avatar user={comment.author} />
        <span aria-hidden="true">{comment.author.displayName}</span>
        <time dateTime={comment.createdAt}>
          {formatRelativeTime(comment.createdAt)}
        </time>
      </header>
      
      <div className="comment-content">
        {comment.content}
      </div>
      
      <div 
        className="comment-actions" 
        role="toolbar" 
        aria-label="Comment actions"
      >
        <button 
          aria-pressed={comment.isLiked}
          aria-label={`Like comment. ${comment.likesCount} likes`}
        >
          👍 {comment.likesCount}
        </button>
        <button aria-label="Reply to comment">
          Reply
        </button>
      </div>
    </article>
  );
}
```

#### 8.3.3 Live Regions for Updates

```javascript
function CommentSection({ postId }) {
  const [announcement, setAnnouncement] = useState('');
  
  const onNewComment = (comment) => {
    setAnnouncement(
      `New comment from ${comment.author.displayName}: ${comment.content.substring(0, 50)}`
    );
    // Clear after screen reader has time to announce
    setTimeout(() => setAnnouncement(''), 1000);
  };
  
  return (
    <>
      {/* Live region for announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      <div className="comment-section">
        {/* Comments... */}
      </div>
    </>
  );
}
```

### 8.4 Moderation Features

#### 8.4.1 Comment Reporting (Future Feature)

```javascript
// Report schema
{
  _id: ObjectId,
  comment: ObjectId,
  reporter: ObjectId,
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'other']
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId,
  action: {
    type: String,
    enum: ['none', 'warned', 'deleted', 'user_banned']
  }
}
```

#### 8.4.2 Bulk Delete (Teacher)

```javascript
async function bulkDeleteComments(commentIds, teacherId) {
  // Verify teacher role
  const teacher = await User.findById(teacherId);
  if (teacher.role !== 'teacher') {
    throw new Error('Not authorized');
  }
  
  // Soft delete all selected comments
  const result = await Comment.updateMany(
    { _id: { $in: commentIds } },
    { 
      $set: { 
        isDeleted: true, 
        deletedAt: new Date(),
        deletedBy: teacherId
      } 
    }
  );
  
  return { deletedCount: result.modifiedCount };
}
```

#### 8.4.3 Word Filter (Optional)

```javascript
const bannedWords = ['spam', 'inappropriate', ...];

function filterContent(content) {
  let filtered = content;
  
  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  
  return filtered;
}
```

### 8.5 Analytics & Metrics

#### 8.5.1 Comment Analytics (Teacher Dashboard)

```javascript
async function getCommentAnalytics(dateRange) {
  const { startDate, endDate } = dateRange;
  
  // Total comments
  const totalComments = await Comment.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // Average thread depth
  const depthStats = await Comment.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { 
      _id: null, 
      avgDepth: { $avg: '$depth' },
      maxDepth: { $max: '$depth' }
    }}
  ]);
  
  // Most active commenters
  const topCommenters = await Comment.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { 
      _id: '$author._id', 
      count: { $sum: 1 },
      author: { $first: '$author' }
    }},
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Most discussed posts (by comment count)
  const mostDiscussed = await Post.find()
    .sort({ commentsCount: -1 })
    .limit(5)
    .select('_id content commentsCount createdAt');
  
  // Engagement rate (comments per post)
  const totalPosts = await Post.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  const engagementRate = totalPosts > 0 ? totalComments / totalPosts : 0;
  
  return {
    totalComments,
    avgThreadDepth: depthStats[0]?.avgDepth || 0,
    maxThreadDepth: depthStats[0]?.maxDepth || 0,
    topCommenters,
    mostDiscussed,
    engagementRate,
    commentsPerPost: engagementRate.toFixed(1)
  };
}
```

---

## 9. UI/UX Wireframes

### 9.1 Core Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           HEADER BAR                                    │ │
│ │  🇪🇸 SpanishConnect    [🔍]     [🔔 3]  [✉️ 2]  [👤 Carlos ▼]         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├──────────────────┬──────────────────────────────────────┬───────────────────┤
│                  │                                      │                   │
│    SIDEBAR       │           MAIN CONTENT               │    SIDEBAR        │
│    (Left)        │           (Center)                   │    (Right)        │
│                  │                                      │                   │
│  ┌────────────┐  │  ┌──────────────────────────────┐   │  ┌─────────────┐  │
│  │ 🏠 Home    │  │  │                              │   │  │ TEACHER     │  │
│  │ 📚 Files   │  │  │     POST CARDS               │   │  │ PROFILE     │  │
│  │ 💬 Messages│  │  │     (Scrollable)             │   │  │             │  │
│  │ 🔖 Saved   │  │  │                              │   │  │ [Avatar]    │  │
│  │ 👤 Profile │  │  │                              │   │  │ Profesora   │  │
│  └────────────┘  │  │                              │   │  │ María       │  │
│                  │  │                              │   │  │             │  │
│  ┌────────────┐  │  │                              │   │  │ 📊 45 posts │  │
│  │ QUICK      │  │  │                              │   │  │ 👥 87       │  │
│  │ STATS      │  │  │                              │   │  │ students    │  │
│  │            │  │  │                              │   │  │             │  │
│  │ 47 Comments│  │  │                              │   │  └─────────────┘  │
│  │ 12 Downloads  │  │                              │   │                   │
│  │ 5 Unread   │  │  │                              │   │  ┌─────────────┐  │
│  └────────────┘  │  │                              │   │  │ RESOURCES   │  │
│                  │  └──────────────────────────────┘   │  │             │  │
│                  │                                      │  │ 📄 Latest   │  │
│                  │                                      │  │   Files     │  │
│                  │                                      │  └─────────────┘  │
│                  │                                      │                   │
└──────────────────┴──────────────────────────────────────┴───────────────────┘

RESPONSIVE BREAKPOINTS:
- Desktop (>1200px): 3-column layout
- Tablet (768-1199px): 2-column (hide right sidebar)  
- Mobile (<768px): Single column (hamburger menu for left sidebar)
```

### 9.2 Post Card Component

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌────┐  Profesora María                            · 2h ago   │
│  │ 👩‍🏫 │  @profesora · Teacher                          [···]   │
│  └────┘                                                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📚 **Lesson 5: Ser vs Estar**                                 │
│                                                                 │
│  Today we'll dive deep into one of the trickiest concepts     │
│  in Spanish - the difference between "ser" and "estar".       │
│  Both mean "to be" in English, but they're used in very      │
│  different contexts.                                           │
│                                                                 │
│  **Key Rules:**                                                │
│  • **SER** - Permanent characteristics, identity, origin      │
│  • **ESTAR** - Temporary states, location, conditions         │
│                                                                 │
│  Watch the video below for detailed examples! 👇               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                    ▶️                                   │   │
│  │                                                         │   │
│  │            [VIDEO THUMBNAIL]                            │   │
│  │             Lesson 5 - Ser vs Estar                     │   │
│  │                  15:32                                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────┐ ┌────────────┐                                 │
│  │  img1.jpg  │ │  img2.jpg  │   +2 more                       │
│  └────────────┘ └────────────┘                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  👍 24   ❤️ 8   💡 12          💬 47 comments   🔖 15 saved    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  👍 Like    │  │  💬 Comment │  │  🔖 Save    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📌 PINNED COMMENT                                             │
│  ┌────┐  Teacher · 1h ago                                      │
│  │ 👩‍🏫 │  Make sure to download the practice worksheet         │
│  └────┘  from the Files section! Link: [Worksheet]             │
│          👍 8                                                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ▼ View all 47 comments                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Expanded Comment Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  💬 47 Comments                           [Sort: Newest ▼]     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Your Avatar]                                           │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ Write a comment...                                  │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  ┌────┐  María García · 2h ago                         [···]   │
│  │ 👩 │  This lesson was very helpful! I finally understand    │
│  └────┘  the difference between ser and estar.                 │
│          👍 5   [Reply]   [Like]                                │
│          │                                                      │
│          │   ┌────┐  Teacher · 1h ago                  📌      │
│          ├──│ 👩‍🏫 │  ¡Excelente María! Keep practicing with    │
│          │   └────┘  the exercises in the PDF.                 │
│          │          👍 3   [Reply]   [Like]                     │
│          │          │                                           │
│          │          │   ┌────┐  María García · 45m ago         │
│          │          ├──│ 👩 │  Thank you! Quick question -     │
│          │          │   └────┘  when do we use "estar" for     │
│          │          │          location vs "ser" for events?   │
│          │          │          👍 1   [Reply]   [Like]          │
│          │          │          │                                │
│          │          │          │   ┌────┐  Teacher · 30m ago   │
│          │          │          └──│ 👩‍🏫 │  Great question!     │
│          │          │              └────┘  "Estar" is for      │
│          │          │                      physical location.  │
│          │          │                      "Ser" is for where  │
│          │          │                      events take place.  │
│          │          │                      👍 8   [Reply]       │
│          │          │                      │                    │
│          │          │                      └── ▼ View 7 more   │
│          │          │                           replies        │
│          │          │                                           │
│          │          └── ▼ View 2 more replies                  │
│          │                                                      │
│          └── [+] 2 more replies                                │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  ┌────┐  Carlos Ruiz · 1h ago                          [···]   │
│  │ 👨 │  When is the next live session? I want to practice    │
│  └────┘  speaking with the class.                              │
│          👍 3   [Reply]   [Like]                                │
│          │                                                      │
│          └──┌────┐  Teacher · 55m ago                          │
│             │ 👩‍🏫 │  Next Thursday at 7pm! I'll post the Zoom  │
│             └────┘  link tomorrow.                              │
│                     👍 4   [Reply]   [Like]                     │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│                    ▼ Load more comments (35 remaining)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Reply Composer (Inline)

```
┌─────────────────────────────────────────────────────────────────┐
│  │                                                              │
│  │   ┌────┐  Teacher · 30m ago                                 │
│  └──│ 👩‍🏫 │  Great question! "Estar" is for physical location.│
│      └────┘  👍 8   [Reply]   [Like]                            │
│              │                                                  │
│              └── ┌──────────────────────────────────────────┐  │
│                  │ ┌────┐                                   │  │
│                  │ │ 👤 │  ┌──────────────────────────────┐│  │
│                  │ └────┘  │ @profesora Thank you!        ││  │
│                  │         │ I have one more question...  ││  │
│                  │         │                              ││  │
│                  │         └──────────────────────────────┘│  │
│                  │                                         │  │
│                  │  Replying to @profesora                 │  │
│                  │  45/2000                                │  │
│                  │                                         │  │
│                  │                    [Cancel]  [Reply 📤] │  │
│                  └──────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.5 Files Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  📁 Files & Modules                              [+ New Folder] │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📂 > Files > Beginner Lessons > Week 1 - Greetings      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [🔍 Search files...]               [Sort: Name ▼] [View: 📋]  │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  📁 FOLDERS                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📁 Week 2 - Numbers              5 files    Jan 15      │   │
│  │ 📁 Week 3 - Colors               3 files    Jan 22      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📄 FILES                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  📄  Spanish Vocabulary List.pdf                        │   │
│  │      2.3 MB · PDF · Uploaded Jan 8                      │   │
│  │      ⬇️ 45 downloads                          [⬇️ Download]│   │
│  │                                                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  📊  Lesson Slides - Greetings.pptx                     │   │
│  │      5.1 MB · PPTX · Uploaded Jan 8                     │   │
│  │      ⬇️ 38 downloads                          [⬇️ Download]│   │
│  │                                                         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  🎵  Pronunciation Guide.mp3                            │   │
│  │      3.4 MB · MP3 · 12:45 duration · Uploaded Jan 10    │   │
│  │      ⬇️ 22 downloads                          [⬇️ Download]│   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.6 Mobile Layouts

#### Mobile Navigation
```
┌─────────────────────────────┐
│ ☰  🇪🇸 SpanishConnect  🔔 👤 │
├─────────────────────────────┤
│                             │
│    [MAIN CONTENT AREA]      │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ 🏠    📚    ➕    💬    👤  │
│Home  Files  New  Msgs  Me   │
└─────────────────────────────┘
```

#### Mobile Post Card
```
┌─────────────────────────────┐
│ [👩‍🏫] Profesora María  · 2h │
├─────────────────────────────┤
│                             │
│ 📚 Lesson 5: Ser vs Estar  │
│                             │
│ Today we'll dive deep      │
│ into one of the...         │
│ [Read more]                 │
│                             │
│ ┌─────────────────────────┐ │
│ │    [VIDEO THUMBNAIL]    │ │
│ │         ▶️ 15:32        │ │
│ └─────────────────────────┘ │
│                             │
│ 👍24 ❤️8 💡12    💬47  🔖15 │
├─────────────────────────────┤
│  👍     💬     🔖     ···   │
│ Like  Comment  Save  More  │
└─────────────────────────────┘
```

#### Mobile Comment Thread
```
┌─────────────────────────────┐
│ 💬 47 Comments    [Newest▼] │
├─────────────────────────────┤
│                             │
│ [👩] María · 2h             │
│ This lesson was helpful!   │
│ 👍5  Reply                  │
│ │                           │
│ ├─[👩‍🏫] Teacher · 1h   📌   │
│ │  ¡Excelente María!       │
│ │  👍3  Reply               │
│ │  │                        │
│ │  ├─[👩] María · 45m       │
│ │  │  Quick question...    │
│ │  │  👍1  Reply            │
│ │  │                        │
│ │  └─ View 3 more replies  │
│ │                           │
│ └─ View 2 more replies     │
│                             │
│ ─────────────────────────── │
│                             │
│ [👨] Carlos · 1h            │
│ When is the next live...   │
│                             │
│ ▼ Load 35 more comments    │
│                             │
└─────────────────────────────┘
```

### 9.7 Loading States

```
POST SKELETON:
┌─────────────────────────────────────────────────────────────────┐
│ ┌────┐  ████████████████                          · ████       │
│ │░░░░│  ██████████                                             │
│ └────┘                                                          │
│ ─────────────────────────────────────────────────────────────── │
│ █████████████████████████████████████████████████████████████  │
│ █████████████████████████████████████████████████████████████  │
│ ██████████████████████████████████████                         │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░││
│ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ████  ████  ████         ████████    ████████                  │
└─────────────────────────────────────────────────────────────────┘

COMMENT SKELETON:
│ ┌────┐  ████████████  · ████
│ │░░░░│  █████████████████████████████████████
│ └────┘  █████████████████████████████
│         ████  ████  ████
```

### 9.8 Empty States

```
NO POSTS YET:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          📚                                     │
│                                                                 │
│                   No lessons yet                                │
│                                                                 │
│         Your teacher will post lessons here soon.              │
│         Check back later or enable notifications!              │
│                                                                 │
│                  [🔔 Enable Notifications]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

NO COMMENTS YET:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          💬                                     │
│                                                                 │
│               Be the first to comment!                         │
│                                                                 │
│          Share your thoughts or ask a question.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Performance Considerations

### 10.1 Frontend Optimizations

#### 10.1.1 Code Splitting & Lazy Loading
```javascript
// Route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const Post = lazy(() => import('./pages/Post'));
const Files = lazy(() => import('./pages/Files'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));

// Component-level splitting for heavy components
const PostComposer = lazy(() => import('./components/PostComposer'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
```

#### 10.1.2 Image Optimization
```javascript
// Cloudinary responsive images
function OptimizedImage({ publicId, alt, sizes }) {
  return (
    <picture>
      {/* WebP for modern browsers */}
      <source
        type="image/webp"
        srcSet={`
          ${cloudinaryUrl(publicId, { w: 400, f: 'webp' })} 400w,
          ${cloudinaryUrl(publicId, { w: 800, f: 'webp' })} 800w,
          ${cloudinaryUrl(publicId, { w: 1200, f: 'webp' })} 1200w
        `}
        sizes={sizes}
      />
      {/* Fallback for older browsers */}
      <img
        src={cloudinaryUrl(publicId, { w: 800 })}
        srcSet={`
          ${cloudinaryUrl(publicId, { w: 400 })} 400w,
          ${cloudinaryUrl(publicId, { w: 800 })} 800w,
          ${cloudinaryUrl(publicId, { w: 1200 })} 1200w
        `}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
```

#### 10.1.3 Virtual Scrolling for Large Lists
```javascript
import { Virtuoso } from 'react-virtuoso';

function VirtualizedCommentList({ comments, loadMore, hasMore }) {
  return (
    <Virtuoso
      style={{ height: '600px' }}
      data={comments}
      endReached={loadMore}
      overscan={200}
      itemContent={(index, comment) => (
        <CommentThread key={comment._id} comment={comment} />
      )}
      components={{
        Footer: () => hasMore ? <LoadingSpinner /> : null
      }}
    />
  );
}
```

#### 10.1.4 Optimistic Updates
```javascript
// Example: Like a comment with optimistic update
async function likeComment(commentId) {
  // 1. Optimistic update (instant UI feedback)
  setComments(prev => updateCommentLike(prev, commentId, true));
  
  try {
    // 2. API call
    await api.likeComment(commentId);
  } catch (error) {
    // 3. Rollback on failure
    setComments(prev => updateCommentLike(prev, commentId, false));
    toast.error('Failed to like comment');
  }
}
```

#### 10.1.5 Debouncing & Throttling
```javascript
// Debounce search input
const debouncedSearch = useDebouncedCallback(
  (query) => searchComments(query),
  300
);

// Throttle scroll-based actions
const throttledLoadMore = useThrottledCallback(
  () => loadMoreComments(),
  1000
);
```

### 10.2 Backend Optimizations

#### 10.2.1 Database Query Optimization
```javascript
// BAD: N+1 query problem
const comments = await Comment.find({ post: postId });
for (const comment of comments) {
  comment.replies = await Comment.find({ parentComment: comment._id });
}

// GOOD: Single aggregation with lookup
const comments = await Comment.aggregate([
  { $match: { post: ObjectId(postId), parentComment: null } },
  { $sort: { createdAt: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: 'comments',
      localField: '_id',
      foreignField: 'parentComment',
      pipeline: [
        { $sort: { createdAt: -1 } },
        { $limit: 3 }
      ],
      as: 'replies'
    }
  }
]);
```

#### 10.2.2 Selective Field Projection
```javascript
// Only fetch needed fields
const posts = await Post.find()
  .select('author content media reactionsCount commentsCount createdAt isPinned')
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();  // Return plain objects (faster)
```

#### 10.2.3 Connection Pooling
```javascript
// Serverless-optimized MongoDB connection
let cachedConnection = null;

async function getConnection() {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }
  
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,  // Limit for free tier
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  });
  
  return cachedConnection;
}
```

#### 10.2.4 Response Compression
```javascript
const compression = require('compression');

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6  // Balance between speed and compression
}));
```

### 10.3 Caching Strategy

#### 10.3.1 Client-Side Caching with React Query
```javascript
// Configure React Query with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,      // 30 seconds
      cacheTime: 5 * 60 * 1000,  // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Example: Cached posts query
function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => api.getPosts({ page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: 60 * 1000,  // Posts cache for 1 minute
  });
}

// Example: Cached comments with shorter stale time
function useComments(postId) {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam = 1 }) => api.getComments(postId, { page: pageParam }),
    staleTime: 15 * 1000,  // Comments refresh more frequently
  });
}
```

#### 10.3.2 API Response Caching Headers
```javascript
// Cache static assets aggressively
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}));

// Cache API responses appropriately
function setCacheHeaders(res, type) {
  switch (type) {
    case 'public-list':
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      break;
    case 'user-specific':
      res.set('Cache-Control', 'private, max-age=30');
      break;
    case 'no-cache':
      res.set('Cache-Control', 'no-store');
      break;
  }
}
```

### 10.4 Bundle Size Optimization

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit'],
        }
      }
    },
    // Target modern browsers
    target: 'es2020',
    // Minimize bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 10.5 Performance Budgets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.5s | < 2.5s |
| Largest Contentful Paint (LCP) | < 2.5s | < 4.0s |
| Time to Interactive (TTI) | < 3.5s | < 5.0s |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.25 |
| Total Bundle Size (gzipped) | < 150KB | < 250KB |
| API Response Time (p95) | < 500ms | < 1000ms |

### 10.6 Monitoring & Alerts

```javascript
// Performance monitoring with Web Vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 11. Security & Privacy

### 11.1 Authentication Security

#### 11.1.1 Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: 1 special character
- Not in common password lists

#### 11.1.2 Password Storage
```javascript
const bcrypt = require('bcryptjs');

// Hash password before storing
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);  // 12 rounds
  return bcrypt.hash(password, salt);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

#### 11.1.3 JWT Security
```javascript
const jwt = require('jsonwebtoken');

// Access token (short-lived)
function generateAccessToken(user) {
  return jwt.sign(
    { 
      sub: user._id,
      role: user.role,
      type: 'access'
    },
    process.env.JWT_ACCESS_SECRET,
    { 
      expiresIn: '15m',
      issuer: 'spanishconnect',
      audience: 'spanishconnect-api'
    }
  );
}

// Refresh token (long-lived)
function generateRefreshToken(user) {
  return jwt.sign(
    { 
      sub: user._id,
      type: 'refresh',
      jti: crypto.randomUUID()  // Unique token ID for revocation
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}
```

### 11.2 Input Validation & Sanitization

#### 11.2.1 Request Validation with Joi
```javascript
const Joi = require('joi');

const commentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .trim(),
  parentCommentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)  // MongoDB ObjectId
    .allow(null)
});

// Validation middleware
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        }
      });
    }
    
    req.body = value;
    next();
  };
}
```

#### 11.2.2 HTML Sanitization
```javascript
const DOMPurify = require('isomorphic-dompurify');

function sanitizeContent(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
}
```

### 11.3 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 attempts per 15 minutes
  skipSuccessfulRequests: true  // Don't count successful logins
});

// Comment creation limit
const commentLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,  // 10 comments per minute
  keyGenerator: (req) => req.user._id.toString()
});
```

### 11.4 CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://spanishconnect.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
```

### 11.5 File Upload Security

```javascript
const multer = require('multer');

// File type validation
const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024,  // 200MB max (videos compressed via Cloudinary)
    files: 6  // Max 6 files (5 images + 1 video)
  },
  fileFilter: (req, file, cb) => {
    const allAllowed = [
      ...allowedMimeTypes.image,
      ...allowedMimeTypes.video,
      ...allowedMimeTypes.document
    ];
    
    if (allAllowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});
```

### 11.6 Privacy Considerations

#### 11.6.1 Data Minimization
- Only collect necessary user data
- Don't store IP addresses long-term
- Anonymize analytics data

#### 11.6.2 Right to Deletion
```javascript
async function deleteUserAccount(userId) {
  // Anonymize comments (preserve thread structure)
  await Comment.updateMany(
    { 'author._id': userId },
    { 
      $set: { 
        'author.username': 'deleted_user',
        'author.displayName': 'Deleted User',
        'author.avatarUrl': null
      }
    }
  );
  
  // Delete messages
  await Message.deleteMany({ 'sender._id': userId });
  
  // Delete notifications
  await Notification.deleteMany({ recipient: userId });
  
  // Delete Cloudinary assets
  await cloudinary.api.delete_resources_by_prefix(`spanishconnect/avatars/${userId}`);
  
  // Delete user document
  await User.findByIdAndDelete(userId);
}
```

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

```
                    ┌──────────────┐
                    │     E2E      │  ← 10% (Critical paths)
                    │    Tests     │
                 ┌──┴──────────────┴──┐
                 │   Integration      │  ← 30% (API, DB)
                 │      Tests         │
              ┌──┴────────────────────┴──┐
              │        Unit Tests        │  ← 60% (Functions, components)
              └──────────────────────────┘
```

### 12.2 Unit Tests

#### 12.2.1 Frontend Component Tests
```javascript
// CommentCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentCard } from './CommentCard';

describe('CommentCard', () => {
  const mockComment = {
    _id: 'comment123',
    content: 'Test comment content',
    author: {
      _id: 'user456',
      displayName: 'Test User',
      avatarUrl: null,
      role: 'student'
    },
    likesCount: 5,
    repliesCount: 3,
    isPinned: false,
    isDeleted: false,
    createdAt: new Date().toISOString()
  };

  test('renders comment content', () => {
    render(<CommentCard comment={mockComment} />);
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
  });

  test('displays author name', () => {
    render(<CommentCard comment={mockComment} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('shows likes count', () => {
    render(<CommentCard comment={mockComment} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('handles like button click', async () => {
    const onLike = jest.fn();
    render(<CommentCard comment={mockComment} onLike={onLike} />);
    
    fireEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(onLike).toHaveBeenCalledWith('comment123');
  });

  test('shows pinned badge when pinned', () => {
    render(<CommentCard comment={{ ...mockComment, isPinned: true }} />);
    expect(screen.getByText('📌')).toBeInTheDocument();
  });

  test('renders deleted state correctly', () => {
    render(<CommentCard comment={{ ...mockComment, isDeleted: true }} />);
    expect(screen.getByText('[Comment deleted]')).toBeInTheDocument();
  });
});
```

#### 12.2.2 Backend Utility Tests
```javascript
// utils/threading.test.js
const { calculatePath, validateDepth } = require('./threading');

describe('Comment Threading Utils', () => {
  describe('calculatePath', () => {
    test('returns own ID for root comment', () => {
      const path = calculatePath(null, 'newComment123');
      expect(path).toBe('newComment123');
    });

    test('appends to parent path', () => {
      const parentPath = 'root123/parent456';
      const path = calculatePath(parentPath, 'newComment789');
      expect(path).toBe('root123/parent456/newComment789');
    });
  });

  describe('validateDepth', () => {
    test('returns 0 for root comments', () => {
      expect(validateDepth(null)).toBe(0);
    });

    test('increments parent depth', () => {
      expect(validateDepth({ depth: 2 })).toBe(3);
    });

    test('throws error for max depth exceeded', () => {
      expect(() => validateDepth({ depth: 100 })).toThrow();
    });
  });
});
```

### 12.3 Integration Tests

#### 12.3.1 API Endpoint Tests
```javascript
// comments.api.test.js
const request = require('supertest');
const { app } = require('../app');
const { connectDB, closeDB, clearDB } = require('./testDb');

describe('Comments API', () => {
  let authToken;
  let postId;
  let commentId;

  beforeAll(async () => {
    await connectDB();
    // Create test user and login
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123',
        displayName: 'Test User',
        username: 'testuser'
      });
    authToken = res.body.data.accessToken;
    
    // Create test post
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Test post' });
    postId = postRes.body.data.post._id;
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  describe('POST /api/posts/:postId/comments', () => {
    test('creates root comment', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test comment' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.comment.content).toBe('Test comment');
      expect(res.body.data.comment.depth).toBe(0);
      
      commentId = res.body.data.comment._id;
    });

    test('creates nested reply', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          content: 'Reply to comment',
          parentCommentId: commentId 
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.depth).toBe(1);
      expect(res.body.data.comment.parentComment).toBe(commentId);
    });

    test('rejects unauthorized request', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .send({ content: 'Test comment' });

      expect(res.status).toBe(401);
    });

    test('validates content length', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'a'.repeat(2001) });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/posts/:postId/comments', () => {
    test('returns paginated comments', async () => {
      const res = await request(app)
        .get(`/api/posts/${postId}/comments`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.comments)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });
});
```

### 12.4 End-to-End Tests

```javascript
// e2e/comments.spec.js (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Comment System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('[name="email"]', 'student@example.com');
    await page.fill('[name="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('can create a comment on a post', async ({ page }) => {
    // Navigate to a post
    await page.click('.post-card:first-child');
    await page.waitForSelector('.comment-section');
    
    // Write and submit comment
    await page.fill('.comment-composer textarea', 'This is my test comment');
    await page.click('.comment-composer button[type="submit"]');
    
    // Verify comment appears
    await expect(page.locator('.comment-card').last()).toContainText('This is my test comment');
  });

  test('can reply to a comment', async ({ page }) => {
    await page.click('.post-card:first-child');
    await page.waitForSelector('.comment-section');
    
    // Click reply on first comment
    await page.click('.comment-card:first-child button:has-text("Reply")');
    
    // Fill reply
    await page.fill('.reply-composer textarea', 'This is my reply');
    await page.click('.reply-composer button:has-text("Reply")');
    
    // Verify reply appears nested
    await expect(page.locator('.comment-thread .comment-card').nth(1)).toContainText('This is my reply');
  });

  test('can like a comment', async ({ page }) => {
    await page.click('.post-card:first-child');
    await page.waitForSelector('.comment-section');
    
    const likeButton = page.locator('.comment-card:first-child button:has-text("👍")');
    const initialCount = await likeButton.textContent();
    
    await likeButton.click();
    
    // Verify count increased
    await expect(likeButton).not.toHaveText(initialCount);
  });

  test('can expand collapsed replies', async ({ page }) => {
    await page.click('.post-card:first-child');
    await page.waitForSelector('.comment-section');
    
    // Find and click "View more replies" button
    const expandButton = page.locator('button:has-text("View")').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      
      // Verify more replies loaded
      await expect(page.locator('.comment-thread .comment-card')).toHaveCountGreaterThan(3);
    }
  });

  test('deep link to comment scrolls and highlights', async ({ page }) => {
    // Get a comment ID (would be known from test data)
    const commentId = 'testComment123';
    
    await page.goto(`/post/testPost456#comment-${commentId}`);
    
    // Verify comment is visible and highlighted
    const targetComment = page.locator(`[data-comment-id="${commentId}"]`);
    await expect(targetComment).toBeVisible();
    await expect(targetComment).toHaveClass(/highlight/);
  });
});
```

### 12.5 Test Coverage Goals

| Category | Target Coverage |
|----------|-----------------|
| Unit Tests | 80%+ |
| Integration Tests | 70%+ |
| E2E Critical Paths | 100% |
| Overall | 75%+ |

---

## 13. Deployment Checklist

### 13.1 Pre-Deployment

#### Environment Setup
- [ ] MongoDB Atlas M0 cluster created
- [ ] Cloudinary account configured
- [ ] Vercel project created
- [ ] Domain configured (optional)
- [ ] Environment variables set in Vercel

#### Required Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
RESEND_API_KEY=your-resend-key

# App
NODE_ENV=production
FRONTEND_URL=https://spanishconnect.vercel.app
```

#### Security Checklist
- [ ] Strong JWT secrets (32+ random characters)
- [ ] CORS whitelist configured
- [ ] Rate limiting enabled
- [ ] Password hashing configured (bcrypt 12 rounds)
- [ ] Input validation on all endpoints
- [ ] XSS protection headers
- [ ] CSRF protection for cookie-based auth

#### Database Checklist
- [ ] All indexes created
- [ ] Teacher account seeded
- [ ] Default folders created (Files section)
- [ ] Connection pooling configured

### 13.2 Deployment Steps

#### 1. Deploy Backend (Vercel Serverless)
```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Deploy
vercel --prod
```

#### 2. Deploy Frontend (Vercel)
```bash
# Build and deploy
npm run build
vercel --prod
```

#### 3. Configure Domain (Optional)
- Add custom domain in Vercel dashboard
- Configure DNS records
- Enable HTTPS

### 13.3 Post-Deployment Verification

#### Smoke Tests
- [ ] Homepage loads
- [ ] Login/registration works
- [ ] Teacher can create post
- [ ] Student can view feed
- [ ] Comments can be created
- [ ] Nested replies work
- [ ] File upload/download works
- [ ] Messaging works
- [ ] Notifications appear

#### Performance Verification
- [ ] Lighthouse score > 90
- [ ] API response times < 500ms
- [ ] No console errors
- [ ] Images loading correctly (Cloudinary)

#### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Uptime monitoring

### 13.4 Rollback Plan

```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

---

## 14. Timeline & Milestones

### 14.1 Project Timeline Overview (8 Weeks)

```
Week 1-2: Foundation
├── Project setup & architecture
├── Authentication system
└── Basic database models

Week 3: Posts & Feed
├── Post CRUD operations
├── Media upload to Cloudinary
├── Feed pagination
└── Reactions system

Week 4: Comment System (Part 1)
├── Root-level comments
├── Basic threading (depth 1-2)
├── Like functionality
└── Comment creation API

Week 5: Comment System (Part 2)
├── Infinite nesting
├── Collapse/expand UI
├── Deep linking
├── Comment pagination
└── @mentions

Week 6: Files & Messaging
├── Files/Modules section
├── GridFS integration
├── Direct messaging
├── Read receipts

Week 7: Notifications & Polish
├── Notification system
├── Email notifications
├── Mobile responsiveness
├── Performance optimization

Week 8: Testing & Launch
├── E2E testing
├── Bug fixes
├── Documentation
└── Production deployment
```

### 14.2 Detailed Phase Breakdown

#### Phase 1: Foundation (Weeks 1-2)

**Week 1: Project Setup**
| Task | Duration | Priority |
|------|----------|----------|
| Initialize React + Vite project | 2h | P0 |
| Configure ESLint, Prettier | 1h | P1 |
| Setup Vercel deployment | 1h | P0 |
| Initialize Express serverless API | 2h | P0 |
| Configure MongoDB Atlas connection | 2h | P0 |
| Setup environment variables | 1h | P0 |
| Create base folder structure | 2h | P1 |
| Configure Cloudinary | 1h | P0 |

**Week 2: Authentication**
| Task | Duration | Priority |
|------|----------|----------|
| User model & validation | 3h | P0 |
| Registration endpoint | 3h | P0 |
| Login endpoint with JWT | 4h | P0 |
| Refresh token mechanism | 3h | P0 |
| Password reset flow | 3h | P1 |
| Auth context (React) | 3h | P0 |
| Protected routes | 2h | P0 |
| Login/Register UI | 4h | P0 |

**Milestone 1:** Users can register, login, and maintain sessions

#### Phase 2: Core Content (Week 3)

**Week 3: Posts & Feed**
| Task | Duration | Priority |
|------|----------|----------|
| Post model schema | 2h | P0 |
| Create post API (teacher) | 3h | P0 |
| Image upload to Cloudinary | 4h | P0 |
| Video upload to Cloudinary | 4h | P0 |
| Get posts (paginated) API | 3h | P0 |
| Post feed UI | 4h | P0 |
| Infinite scroll | 3h | P1 |
| Reaction system API | 3h | P0 |
| Reaction picker UI | 2h | P0 |
| Bookmark functionality | 2h | P1 |
| Post composer UI | 4h | P0 |

**Milestone 2:** Teacher can create posts, students can view feed and react

#### Phase 3: Comment System (Weeks 4-5)

**Week 4: Basic Comments**
| Task | Duration | Priority |
|------|----------|----------|
| Comment model (with threading fields) | 4h | P0 |
| Create comment API | 3h | P0 |
| Get comments (root level) API | 3h | P0 |
| Get replies API | 3h | P0 |
| Comment section UI | 4h | P0 |
| Basic threading UI (depth 2) | 4h | P0 |
| Like comment API | 2h | P0 |
| Like button UI | 2h | P0 |
| Edit comment API | 2h | P1 |
| Delete comment API | 2h | P1 |

**Week 5: Advanced Comments**
| Task | Duration | Priority |
|------|----------|----------|
| Infinite nesting logic | 4h | P0 |
| Thread lines UI | 3h | P0 |
| Collapse/expand functionality | 4h | P0 |
| Comment pagination (lazy load) | 4h | P0 |
| Deep linking implementation | 4h | P0 |
| @mention detection | 3h | P1 |
| Pin comment API (teacher) | 2h | P1 |
| Pinned comment UI | 2h | P1 |
| Reply composer UI | 3h | P0 |
| Virtual scrolling (large threads) | 4h | P2 |

**Milestone 3:** Full comment system with infinite nesting and threading

#### Phase 4: Additional Features (Week 6)

**Week 6: Files & Messaging**
| Task | Duration | Priority |
|------|----------|----------|
| Folder model | 2h | P0 |
| File model | 2h | P0 |
| GridFS setup | 3h | P0 |
| File upload API | 4h | P0 |
| File download API | 3h | P0 |
| File explorer UI | 4h | P0 |
| Folder navigation | 3h | P0 |
| Conversation model | 2h | P0 |
| Message model | 2h | P0 |
| Send message API | 3h | P0 |
| Get messages API | 3h | P0 |
| Chat UI | 4h | P0 |
| Read receipts | 2h | P1 |
| Polling for new messages | 2h | P0 |

**Milestone 4:** Students can download files and message teacher

#### Phase 5: Notifications & Polish (Week 7)

**Week 7: Notifications & Refinement**
| Task | Duration | Priority |
|------|----------|----------|
| Notification model | 2h | P0 |
| Create notification service | 4h | P0 |
| Get notifications API | 2h | P0 |
| Mark as read API | 2h | P0 |
| Notification bell UI | 3h | P0 |
| Notification list UI | 3h | P0 |
| Email notification setup | 3h | P2 |
| Mobile responsive fixes | 4h | P0 |
| Performance audit | 3h | P1 |
| Bundle optimization | 3h | P1 |
| Accessibility audit | 3h | P1 |
| Error handling polish | 2h | P0 |
| Loading states | 2h | P0 |

**Milestone 5:** Full notification system and polished UI

#### Phase 6: Testing & Launch (Week 8)

**Week 8: Launch Preparation**
| Task | Duration | Priority |
|------|----------|----------|
| Unit tests (critical paths) | 6h | P0 |
| Integration tests (API) | 6h | P0 |
| E2E tests (happy paths) | 4h | P0 |
| Bug fixes from testing | 6h | P0 |
| Production environment setup | 3h | P0 |
| Database seeding (teacher account) | 2h | P0 |
| Final deployment | 2h | P0 |
| Smoke testing production | 2h | P0 |
| Documentation | 3h | P1 |
| Handoff / training | 2h | P1 |

**Milestone 6:** Production deployment complete

### 14.3 Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MongoDB free tier limits | High | Medium | Monitor storage, implement cleanup |
| Cloudinary bandwidth exceeded | High | Low | Lazy load media, optimize transformations |
| Vercel timeout (10s) | Medium | Medium | Optimize queries, pagination |
| Complex comment nesting bugs | Medium | High | Thorough testing, fallback UI |
| Mobile performance issues | Medium | Medium | Virtual scrolling, code splitting |

### 14.4 Success Criteria by Milestone

| Milestone | Success Criteria |
|-----------|------------------|
| 1 (Auth) | Users can register, login, stay logged in |
| 2 (Posts) | Teacher creates posts with media, students react |
| 3 (Comments) | Nested comments work to depth 10+, pagination works |
| 4 (Files/Msgs) | File download tracking, messaging functional |
| 5 (Notifications) | Real-time notification bell, mobile works |
| 6 (Launch) | All smoke tests pass, no critical bugs |

---

## 15. Success Metrics & Analytics

### 15.1 Key Performance Indicators (KPIs)

#### User Engagement Metrics
| Metric | Target | Timeline | How to Measure |
|--------|--------|----------|----------------|
| Registered Students | 50+ | 3 months | User count |
| Daily Active Users (DAU) | 30% of registered | 3 months | Login tracking |
| Posts with Comments | >60% | 6 months | commentsCount > 0 |
| Avg Comments per Post | 10+ | 6 months | AVG(commentsCount) |
| Avg Thread Depth | 3+ levels | 6 months | AVG(depth) |
| Session Duration | >8 min | 3 months | Analytics |
| File Download Rate | >80% students | 3 months | Download tracking |
| Message Response Time | <24h | 3 months | Message timestamps |

#### Technical Metrics
| Metric | Target | Monitoring |
|--------|--------|------------|
| API Response Time (p95) | <500ms | Vercel Analytics |
| Error Rate | <1% | Error logging |
| Uptime | 99.5% | Uptime monitor |
| Core Web Vitals (LCP) | <2.5s | Lighthouse |
| MongoDB Storage Used | <80% | Atlas dashboard |
| Cloudinary Bandwidth | <80% | Cloudinary dashboard |

### 15.2 Analytics Dashboard (Teacher View)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 ANALYTICS DASHBOARD                          Last 30 days  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OVERVIEW                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │     87     │ │    156     │ │    523     │ │    89%     │  │
│  │  Students  │ │   Posts    │ │  Comments  │ │ Engagement │  │
│  │  (+12 new) │ │ (this mo.) │ │ (this mo.) │ │   Rate     │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  MOST ENGAGED POSTS                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Lesson 5: Ser vs Estar       47 comments  89 reacts  │   │
│  │ 2. Vocabulary Quiz Week 3       35 comments  67 reacts  │   │
│  │ 3. Grammar Practice Tips        28 comments  54 reacts  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TOP COMMENTERS                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. María García        67 comments   Avg depth: 2.3     │   │
│  │ 2. Carlos Mendez       54 comments   Avg depth: 1.8     │   │
│  │ 3. Ana López           41 comments   Avg depth: 2.1     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  FILE DOWNLOADS                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Vocabulary List Week 3.pdf         145 downloads     │   │
│  │ 2. Grammar Cheat Sheet.pdf            128 downloads     │   │
│  │ 3. Lesson 5 Slides.pptx               112 downloads     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  DISCUSSION DEPTH DISTRIBUTION                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Depth 0 (root):    ████████████████████████  45%       │   │
│  │  Depth 1:           ██████████████           28%        │   │
│  │  Depth 2:           ████████                 15%        │   │
│  │  Depth 3+:          █████                    12%        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 15.3 Data Collection Points

```javascript
// Analytics events to track
const analyticsEvents = {
  // User events
  'user.registered': { userId, referrer },
  'user.logged_in': { userId, device, duration_since_last },
  'user.session_ended': { userId, duration, pages_viewed },
  
  // Content events
  'post.viewed': { postId, userId, duration },
  'post.reacted': { postId, userId, reactionType },
  'post.bookmarked': { postId, userId },
  
  // Comment events
  'comment.created': { commentId, postId, userId, depth, parentId },
  'comment.replied': { commentId, parentId, userId, depth },
  'comment.liked': { commentId, userId },
  'comment.deleted': { commentId, userId },
  
  // File events
  'file.downloaded': { fileId, userId },
  'file.uploaded': { fileId, size, type },
  
  // Message events
  'message.sent': { conversationId, senderId },
  'message.read': { conversationId, userId, delay_seconds }
};
```

---

## 16. Appendices

### 16.1 Glossary

| Term | Definition |
|------|------------|
| Thread | A comment and all its nested replies |
| Root Comment | A top-level comment directly on a post |
| Depth | Nesting level (0 = root, 1 = first reply, etc.) |
| Materialized Path | String storing full ancestry (e.g., "root/parent/this") |
| Soft Delete | Marking as deleted without removing from database |
| httpOnly Cookie | Cookie inaccessible to JavaScript (security) |
| GridFS | MongoDB specification for storing large files |
| Optimistic Update | Updating UI before server confirms |

### 16.2 Reference Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [JWT Best Practices](https://auth0.com/blog/jwt-security-best-practices/)
- [React Query Documentation](https://tanstack.com/query/latest)

### 16.3 Database Indexes Quick Reference

```javascript
// Copy-paste ready index creation
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ isPinned: -1, createdAt: -1 });

db.comments.createIndex({ post: 1, parentComment: 1, createdAt: -1 });
db.comments.createIndex({ post: 1, rootComment: 1, path: 1 });
db.comments.createIndex({ post: 1, depth: 1, likesCount: -1 });
db.comments.createIndex({ post: 1, isPinned: -1 });
db.comments.createIndex({ "author._id": 1, createdAt: -1 });

db.messages.createIndex({ conversation: 1, createdAt: -1 });

db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, isRead: 1 });

db.files.createIndex({ folder: 1, createdAt: -1 });
```

### 16.4 API Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Not logged in |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Database/service down |

### 16.5 Environment Configuration Template

```env
# ===========================================
# SpanishConnect Environment Configuration
# ===========================================

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# MongoDB Atlas (EXAMPLE - Replace with your actual credentials)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/spanishconnect?retryWrites=true&w=majority

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional - Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@spanishconnect.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Initial | First draft |
| 2.0.0 | Feb 2026 | Product Team | Complete expansion - added all sections |

---

*End of Product Requirements Document*
