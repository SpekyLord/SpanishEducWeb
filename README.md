# 🇪🇸 SpanishConnect

A purpose-built, Facebook-inspired educational platform designed exclusively for Spanish language instruction. SpanishConnect bridges the gap between cluttered social media and overly complex Learning Management Systems, providing a focused, engaging environment for teacher-student interaction.

## ✨ Features

### Core Functionality
- **📚 Rich Post Creation** - Teacher can share lessons with text, images, videos, and audio
- **💬 Infinite Nested Comments** - Reddit-style unlimited depth threading for rich academic discussions
- **👍 Reactions System** - 5 reaction types (Like, Love, Celebrate, Insightful, Question)
- **📁 Files & Modules** - Organized document management with folder structure
- **✉️ Direct Messaging** - Private student-teacher communication
- **🔔 Smart Notifications** - Real-time updates for comments, replies, mentions, and messages
- **🔖 Bookmarks** - Save posts for later review

### User Roles
- **Teacher** - Create posts, upload files, moderate discussions, view analytics
- **Student** - Engage with content, comment, message teacher, download materials
- **Guest** - Browse public content (limited access)

## 🛠️ Tech Stack

**Frontend**
- React.js 18+ with Vite
- React Router for navigation
- React Query for data fetching & caching
- TailwindCSS for styling

**Backend**
- Node.js/Express (Vercel Serverless Functions)
- MongoDB Atlas (M0 Free Tier)
- JWT authentication with refresh tokens

**Storage & Media**
- Cloudinary (images, videos, audio)
- MongoDB GridFS (documents: PDF, DOCX, PPTX)

**Hosting**
- Vercel (Frontend + Serverless API)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spanishconnect.git
   cd spanishconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

## 📖 Documentation

- [**Product Requirements Document (PRD)**](docs/PRD.md) - Comprehensive technical specifications
- [**Phase Task Checklist**](docs/phasetask.md) - Development progress tracking

## 🎯 Project Status

**Current Version:** 2.0.0  
**Status:** 🚧 In Development

### Development Timeline
- ✅ **Phase 1:** Foundation & Authentication (Weeks 1-2)
- ✅ **Phase 2:** Posts & Feed (Week 3)
- 🚧 **Phase 3:** Comment System (Weeks 4-5) - *Current*
- ⏳ **Phase 4:** Files & Messaging (Week 6)
- ⏳ **Phase 5:** Notifications & Polish (Week 7)
- ⏳ **Phase 6:** Testing & Launch (Week 8)

## 🌟 Key Differentiators

1. **Infinite Nested Comments** - Unlimited depth threading for rich discussions
2. **Zero Cost** - Built entirely on free tier services
3. **Educational Focus** - No ads, no distractions, purpose-built for learning
4. **Mobile-First** - Fully responsive design for on-the-go learning
5. **Simple Role Model** - Only 3 roles with clear permissions

## 🔒 Security

- Password hashing with bcrypt (12 rounds)
- JWT tokens with httpOnly refresh cookies
- Input validation and sanitization
- Rate limiting on all endpoints
- CORS protection
- XSS and CSRF prevention

## 📊 Performance Goals

- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.5s
- Bundle Size (gzipped) < 150KB
- API Response Time (p95) < 500ms

## 🤝 Contributing

This is a educational project. Contributions, issues, and feature requests are welcome!

## 📝 License

This project is [MIT](LICENSE) licensed.

## 👤 Author

**SpanishConnect Development Team**

---

**Built with ❤️ for Spanish language education**
