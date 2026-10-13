# AKFU Complete Deployment Guide

This guide will walk you through deploying the AKFU platform end-to-end.

## Current Status

✅ **Frontend**: Complete and ready to deploy
- Next.js 14 with TypeScript
- All UI components built
- Integration system implemented
- Routing and navigation complete
- Settings page for account linking

✅ **Backend**: Code ready (needs deployment)
- Node.js/Bun backend with Hono framework
- Authentication system
- Integration endpoints for storing encrypted API keys
- Suno.ai, ElevenLabs, and HiggsField support

## Quick Start: Deploy to Production in 5 Minutes

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Railway account (free tier available)
- Your affiliate links for:
  - Suno: `https://suno.ai?ref=ashiakeyzstudios`
  - ElevenLabs: `https://elevenlabs.io?ref=ashiakeyzstudios`
  - HiggsField: `https://higgsfield.ai?ref=ashiakeyzstudios`

---

## Step 1: Push Frontend to GitHub

```bash
# Navigate to frontend directory
cd /path/to/akfu-frontend

# Create GitHub repository
# Option A: Using GitHub CLI (if installed)
gh repo create akfu-frontend --public --source=. --remote=origin --push

# Option B: Manual - Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/akfu-frontend.git
git branch -M main
git push -u origin main
```

**Expected Result**: Frontend code is now on GitHub
- Repository: `https://github.com/YOUR_USERNAME/akfu-frontend`
- Commits: You should see "Add user integrations system" as the latest commit

---

## Step 2: Deploy Frontend to Vercel

### Using Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# When prompted:
# - Link to existing project? NO (create new)
# - Project name: akfu-frontend
# - Directory: ./
# - Framework: Next.js
```

### Using Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set Framework: **Next.js**
4. Environment Variables: Add `NEXT_PUBLIC_API_URL=https://your-backend-url.com` (we'll set this after backend deployment)
5. Click **Deploy**

**Expected Result**: Frontend is live at `https://akfu-frontend.vercel.app` (or your custom domain)

---

## Step 3: Update Backend with Integration Endpoints

The updated backend file is at `/tmp/akfu-backend-updated.ts`. This includes:

### New Endpoints Added:
- `POST /api/integrations/save` - Save encrypted API keys
- `GET /api/integrations/:projectId` - Retrieve integration settings
- `POST /api/integrations/test/:service` - Test API key validity

### Database Changes:
- New table: `user_integrations` with encrypted field storage

### File: `/tmp/akfu-backend-updated.ts`
Replace your current backend with this file. Key additions:

```typescript
// New integration endpoints for Suno, ElevenLabs, HiggsField
app.post("/api/integrations/save", ...)
app.get("/api/integrations/:projectId", ...)
app.post("/api/integrations/test/:service", ...)

// Encryption utilities for secure credential storage
function encryptValue(value: string)
function decryptValue(encrypted: string)
```

---

## Step 4: Deploy Backend to Railway

### Option A: Using Railway Dashboard
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub:
   - Connect your GitHub repository containing the backend
   - Select the backend.ts file
   - Railway will auto-detect Bun runtime
4. Add Environment Variables:
   ```
   DATABASE_URL=your_sqlite_url
   TOKEN_SECRET=your_secret_key
   PORT=3000
   ADMIN_PASSWORD=your_admin_password
   ENCRYPTION_KEY=a-32-byte-encryption-key-here
   ```
5. Deploy

### Option B: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

**Expected Result**: Backend is live at `https://your-project.up.railway.app`

---

## Step 5: Connect Frontend to Backend

Once backend is deployed:

1. **Update Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app`
   - Redeploy

2. **Test Connection:**
   - Visit frontend URL
   - Go to Settings page
   - Try linking a Suno API key
   - Click "Test Connection" - should show success message

---

## Step 6: Database Setup

Once backend is deployed, initialize the database:

```bash
curl -X POST "https://your-backend-url.up.railway.app/admin/setup-db?admin=YOUR_ADMIN_PASSWORD" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "status": "success",
  "message": "Database setup complete",
  "results": [
    { "email": "student@example.com", "status": "created (needs password setup)" }
  ]
}
```

---

## Step 7: Verify Deployment

Check that everything is working:

### Frontend Checks:
- [ ] Homepage loads (http://your-frontend.vercel.app)
- [ ] Can navigate to Settings page
- [ ] API URL in .env.local shows your backend URL
- [ ] Can see affiliate links for Suno, ElevenLabs, HiggsField

### Backend Checks:
- [ ] Health check: `curl https://your-backend.up.railway.app/health`
- [ ] Response should be: `{"status":"ok"}`

### Integration Checks:
- [ ] Settings page shows "Not Connected" for all services
- [ ] Can paste sample API keys
- [ ] Can click "Test Connection"
- [ ] Settings save successfully

---

## Deployment Checklist

### Frontend
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Frontend loads at production URL
- [ ] All pages accessible (Dashboard, Campus, Station, Settings)

### Backend
- [ ] Backend code updated with integrations endpoints
- [ ] Deployed to Railway (or your hosting choice)
- [ ] Database initialized
- [ ] Environment variables configured
- [ ] Health check passes

### Integrations
- [ ] Students can access Settings page
- [ ] Students can enter Suno API key
- [ ] Students can enter ElevenLabs API key
- [ ] Students can enter HiggsField account
- [ ] Test Connection button works
- [ ] Settings persist after page reload
- [ ] AccountRequiredModal shows when account not linked
- [ ] Song and Voiceover tabs locked until account linked

---

## Environment Variables Reference

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_SUNO_API_KEY=your_suno_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key_here
NEXT_PUBLIC_AUTH_TOKEN=test-token-akfu-2024
```

### Backend (.env or Railway)
```
DATABASE_URL=file:./akfu.db (or your database URL)
TOKEN_SECRET=your_secret_key_for_auth_tokens
PORT=3000
ADMIN_PASSWORD=your_admin_password
ENCRYPTION_KEY=your_32_byte_encryption_key
```

---

## Troubleshooting

### "Cannot connect to API"
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running: `curl https://your-backend.up.railway.app/health`
- Check CORS is enabled (it should be in the new backend code)

### "Integration test failed"
- Verify API key is correct for the service
- Check that service is reachable (not blocked by firewall)
- Backend logs should show details

### "Database locked"
- If using SQLite, ensure only one instance is running
- Check database file permissions
- Restart the application

### "Settings not saving"
- Check backend `/api/integrations/save` endpoint is accessible
- Verify database is initialized
- Check encryption key is set correctly

---

## Support URLs

- **Suno API**: https://suno.ai/api/docs
- **ElevenLabs API**: https://elevenlabs.io/docs/api
- **HiggsField**: https://higgsfield.ai/docs
- **Vercel Deployment**: https://vercel.com/docs
- **Railway Deployment**: https://railway.app/docs

---

## Next Steps After Deployment

1. **Send students the frontend URL**
   - They can bookmark the Settings page
   - They can link their accounts there

2. **Configure Affiliate Tracking**
   - Users see your affiliate links on AccountRequiredModal
   - Clicks are tracked by respective services
   - Earnings accrue to your account

3. **Add More Services (Optional)**
   - Backend can be extended with additional `/api/integrations/*` endpoints
   - Follow the same pattern as Suno/ElevenLabs

4. **Monitor Usage**
   - Check Railway dashboard for backend logs
   - Check Vercel analytics for frontend traffic
   - Monitor credential storage (encrypted in database)

---

## Summary

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway
- **Database**: SQLite with encrypted credential storage
- **API Communication**: CORS-enabled REST endpoints
- **Student Experience**: Link own API keys, automatic feature gating

Total deployment time: ~15-30 minutes

Good luck! 🚀
