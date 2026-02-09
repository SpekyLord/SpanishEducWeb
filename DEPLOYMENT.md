# Deployment Guide - SpanishConnect

## 🚀 Production Deployment Checklist

This guide walks you through securely deploying SpanishConnect to production.

---

## Prerequisites

- [ ] MongoDB Atlas account with production cluster
- [ ] Cloudinary account with production credentials
- [ ] Vercel account (or other hosting provider)
- [ ] Domain name configured (optional)
- [ ] SSL/TLS certificate (provided by Vercel)

---

## Step 1: Environment Configuration

### 1.1 Create Production `.env` File

**⚠️ NEVER commit `.env` to git!**

```bash
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3001
CLIENT_URL=https://your-production-domain.com

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://NEW_USER:NEW_PASSWORD@cluster.mongodb.net/spanishconnect?retryWrites=true&w=majority

# JWT Secrets (Use generated secrets from security audit)
JWT_ACCESS_SECRET=your-64-character-secret-here
JWT_REFRESH_SECRET=your-64-character-secret-here

# CSRF Secret
CSRF_SECRET=your-64-character-secret-here

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-new-api-secret

# Logging
LOG_LEVEL=info
```

### 1.2 Generate New Secrets

Run this command to generate fresh secrets:

```bash
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 2: Database Setup (MongoDB Atlas)

### 2.1 Rotate Database Credentials

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to **Database Access**
3. **Delete** old user: `francisgabrielaustria_db_user`
4. Click **Add New Database User**
5. Create new user with strong password:
   - Username: `spanishconnect_prod`
   - Password: Generate strong password (save securely)
   - Role: `Atlas admin` or `Read and write to any database`
6. Click **Add User**

### 2.2 Update Connection String

1. Go to **Databases** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Update `MONGODB_URI` in `.env` with new username/password

### 2.3 Configure Network Access

1. Go to **Network Access**
2. Click **Add IP Address**
3. For Vercel deployment:
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add specific Vercel IP ranges
4. Click **Confirm**

---

## Step 3: Media Storage Setup (Cloudinary)

### 3.1 Rotate API Credentials

1. Log in to [Cloudinary](https://cloudinary.com/)
2. Go to **Settings** → **Security**
3. Click **Regenerate** next to **API Secret**
4. Copy new credentials:
   - Cloud name
   - API Key
   - API Secret (newly generated)
5. Update `.env` with new values

### 3.2 Configure Upload Presets (Optional)

1. Go to **Settings** → **Upload**
2. Create upload preset for production:
   - Name: `spanishconnect-prod`
   - Mode: `signed`
   - Folder: `spanishconnect/posts`

---

## Step 4: Frontend Configuration

### 4.1 Update API Integration for CSRF

**File:** `src/services/api.ts`

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// CSRF token management
let csrfToken: string | null = null

// Fetch CSRF token on app init
export async function initCSRF() {
  try {
    const response = await api.get('/csrf-token')
    csrfToken = response.data.csrfToken
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
  }
}

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase()

  // Add CSRF token to state-changing requests
  if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(method || '')) {
    config.headers['x-csrf-token'] = csrfToken
  }

  return config
})

// Refresh CSRF token on 403 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.config && !error.config._retry) {
      error.config._retry = true
      await initCSRF()
      return api(error.config)
    }
    return Promise.reject(error)
  }
)

export default api
```

### 4.2 Initialize CSRF in App

**File:** `src/App.tsx`

```typescript
import { useEffect } from 'react'
import { initCSRF } from './services/api'

function App() {
  useEffect(() => {
    initCSRF()
  }, [])

  // ... rest of app
}
```

---

## Step 5: Security Verification

### 5.1 Verify `.gitignore`

Ensure `.env` is in `.gitignore`:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
echo "logs/*.log" >> .gitignore
git add .gitignore
git commit -m "security: ensure .env in .gitignore"
```

### 5.2 Remove `.env` from Git History (If Exposed)

**⚠️ Only run if .env was previously committed!**

```bash
# Option 1: BFG Repo Cleaner (Recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
git clone --mirror https://github.com/YOUR_USERNAME/spanishconnect.git
java -jar bfg.jar --delete-files .env spanishconnect.git
cd spanishconnect.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Option 2: git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push --force --all
git push --force --tags
```

**⚠️ Warning:** Force pushing rewrites history. Notify all collaborators!

---

## Step 6: Deploy to Vercel

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Configure Project

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 6.3 Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables via dashboard
```

### 6.4 Set Environment Variables in Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add all variables from `.env`:
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://your-domain.vercel.app`
   - `MONGODB_URI` = (your connection string)
   - `JWT_ACCESS_SECRET` = (generated secret)
   - `JWT_REFRESH_SECRET` = (generated secret)
   - `CSRF_SECRET` = (generated secret)
   - `CLOUDINARY_CLOUD_NAME` = (your cloud name)
   - `CLOUDINARY_API_KEY` = (your API key)
   - `CLOUDINARY_API_SECRET` = (your API secret)
3. Click **Save**
4. Redeploy: `vercel --prod`

---

## Step 7: Post-Deployment Testing

### 7.1 Security Headers Test

```bash
curl -I https://your-domain.vercel.app/api/health
```

Verify headers are present:
- `strict-transport-security`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`

### 7.2 Rate Limiting Test

Try multiple rapid requests:

```bash
for i in {1..10}; do
  curl -X POST https://your-domain.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

Should return `429 Too Many Requests` after 5 attempts.

### 7.3 CSRF Protection Test

```bash
# Without CSRF token (should fail)
curl -X POST https://your-domain.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: refreshToken=..." \
  -d '{"content":"Test post"}'
# Expected: 403 Forbidden

# With CSRF token (should succeed)
TOKEN=$(curl https://your-domain.vercel.app/api/csrf-token -c cookies.txt | jq -r '.csrfToken')
curl -X POST https://your-domain.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -b cookies.txt \
  -d '{"content":"Test post"}'
# Expected: 201 Created
```

### 7.4 SSL/TLS Test

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.vercel.app

Target grade: **A** or higher

### 7.5 Security Headers Test

Visit: https://securityheaders.com/?q=https://your-domain.vercel.app

Target grade: **A** or higher

---

## Step 8: Monitoring Setup

### 8.1 Configure Log Monitoring

Vercel automatically captures logs. View them at:
- Vercel Dashboard → Your Project → **Deployments** → Click deployment → **Functions** tab

### 8.2 Set Up Error Alerting

1. Go to Vercel Dashboard → **Integrations**
2. Install monitoring service (e.g., Sentry, LogRocket)
3. Configure error thresholds and notifications

### 8.3 Database Monitoring

1. MongoDB Atlas → **Metrics**
2. Set up alerts for:
   - High CPU usage (> 80%)
   - Storage near limit (> 400MB)
   - Slow queries (> 100ms)

---

## Step 9: Performance Optimization

### 9.1 Enable Compression

Vercel automatically compresses responses. Verify:

```bash
curl -H "Accept-Encoding: gzip" -I https://your-domain.vercel.app
```

Should include: `content-encoding: gzip`

### 9.2 Configure Caching

Update Vercel configuration for static assets:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Step 10: Backup Strategy

### 10.1 Database Backups

MongoDB Atlas includes automatic backups (free tier):
- Continuous backups every 6 hours
- Retained for 2 days
- Manual snapshots available

### 10.2 Manual Backup

```bash
# Export database
mongodump --uri="mongodb+srv://USER:PASS@cluster.mongodb.net/spanishconnect" --out=./backup

# Restore database
mongorestore --uri="mongodb+srv://USER:PASS@cluster.mongodb.net/spanishconnect" ./backup
```

---

## Troubleshooting

### Issue: CORS Errors

**Solution:** Verify `CLIENT_URL` in environment variables matches your domain exactly.

### Issue: CSRF Token Errors

**Solution:**
1. Ensure frontend calls `initCSRF()` on mount
2. Verify `withCredentials: true` in axios config
3. Check browser console for CSRF token

### Issue: Rate Limiting Too Strict

**Solution:** Adjust limits in `api/index.js`:

```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increase from 100
  // ...
})
```

### Issue: Database Connection Fails

**Solution:**
1. Verify MongoDB connection string
2. Check network access allows Vercel IPs (0.0.0.0/0)
3. Verify database user has correct permissions

---

## Rollback Plan

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Or deploy specific version
vercel --prod --force
```

---

## Maintenance

### Weekly Tasks
- [ ] Review error logs
- [ ] Check rate limiting metrics
- [ ] Monitor database storage

### Monthly Tasks
- [ ] Run `npm audit` and update dependencies
- [ ] Review security logs
- [ ] Rotate API keys (optional)
- [ ] Test backup restoration

### Quarterly Tasks
- [ ] Full security audit
- [ ] Performance review
- [ ] Update SSL certificates (automatic with Vercel)

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Security Issues: See `SECURITY.md`

---

**Deployment completed? Mark your progress:**

- [ ] Environment configured
- [ ] Database credentials rotated
- [ ] Cloudinary credentials rotated
- [ ] Frontend CSRF integrated
- [ ] Deployed to Vercel
- [ ] Security tests passed
- [ ] Monitoring configured
- [ ] Backup strategy in place

**Congratulations! Your application is securely deployed! 🎉**
