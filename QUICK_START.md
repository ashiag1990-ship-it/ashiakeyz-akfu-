# AKFU Quick Start Card

Print this or keep it handy while deploying.

---

## 5-Minute Deployment

### 1. Frontend to Vercel (2 min)
```bash
npm install -g vercel
vercel --prod
```
**Result**: `https://your-project.vercel.app`

### 2. Backend to Railway (2 min)
```
railway.app → New Project → Upload backend.ts
Set environment variables (see below)
Deploy
```
**Result**: `https://your-project.railway.app`

### 3. Connect (1 min)
Vercel → Settings → Env Variables
Add: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`
Redeploy

---

## Environment Variables

**Frontend (Vercel)**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Backend (Railway)**
```
DATABASE_URL=file:./akfu.db
TOKEN_SECRET=supersecretkey123
ADMIN_PASSWORD=admin123
ENCRYPTION_KEY=this-is-32-bytes-encryption-key!!!
PORT=3000
```

---

## Testing URLs

```
Health Check:
curl https://your-backend.railway.app/health

Should return: {"status":"ok"}
```

---

## Student Flow

1. Student visits your frontend URL
2. Navigates to Settings page
3. Pastes their Suno API key
4. Clicks "Test Connection"
5. Click "Save All Settings"
6. Go to Station page
7. Song/Voiceover tabs now accessible

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Cannot reach API" | Check NEXT_PUBLIC_API_URL in Vercel |
| "Test failed" | Verify API key is correct, try again |
| "Database locked" | Restart backend instance |
| "CORS error" | Already enabled, check origin URL |

---

## Key Files

| File | Purpose |
|------|---------|
| DEPLOYMENT_READY.md | Overview (read first) |
| COMPLETE_DEPLOYMENT_GUIDE.md | Step-by-step |
| BACKEND_SETUP.md | Backend docs |
| backend.ts | Your backend code |

---

## Student Links

- **Settings Page**: `/settings`
- **Suno Signup**: https://suno.ai?ref=ashiakeyzstudios
- **ElevenLabs Signup**: https://elevenlabs.io?ref=ashiakeyzstudios
- **HiggsField Signup**: https://higgsfield.ai?ref=ashiakeyzstudios

---

## Success Checklist

- [ ] Frontend URL works
- [ ] Backend health check returns ok
- [ ] Settings page loads
- [ ] Can save API keys
- [ ] Test Connection works
- [ ] Settings persist
- [ ] AccountRequiredModal shows

---

## Helpful Commands

```bash
# Test backend health
curl https://your-backend.railway.app/health

# View Railway logs
railway logs

# Rebuild frontend
cd /tmp/akfu-frontend
npm run build

# Run locally
npm run dev        # Frontend
bun backend.ts     # Backend
```

---

## Contact Support

- Vercel: vercel.com/support
- Railway: railway.app/support
- Backend Issues: See BACKEND_SETUP.md

---

**You're ready! Deploy now.** 🚀
