# AKFU Frontend - Deploy Now

## Quick Deploy (5 min)

### Option 1: Deploy to Vercel (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/ashiag1990-ship-it/akfu-frontend.git
cd akfu-frontend

# 2. Install dependencies
npm install

# 3. Set environment variables in .env.local
NEXT_PUBLIC_API_URL=https://ashiakeyz-akfu-production.up.railway.app
NEXT_PUBLIC_SUNO_API_KEY=<your-suno-key>
NEXT_PUBLIC_ELEVENLABS_API_KEY=<your-elevenlabs-key>
NEXT_PUBLIC_AUTH_TOKEN=<your-jwt-token>

# 4. Test locally
npm run dev
# Open http://localhost:3000

# 5. Deploy to Vercel
npm install -g vercel
vercel
# Follow prompts → deploys to production
```

### Option 2: Deploy to Railway

```bash
# Same as above, but:
railway login
railway init
railway up
```

---

## What's Included

✅ Campus map (SVG, 12 building hotspots)
✅ Welcome Hub (6 project stations)
✅ Sound Lab (6 audio stations)
✅ Suno.ai integration (song generation)
✅ ElevenLabs integration (voiceover)
✅ Web Audio API mixer
✅ API client (auto-connected to backend)
✅ Zustand state management
✅ Tailwind CSS (cinematic theme)
✅ TypeScript throughout
✅ Mobile responsive

---

## API Keys Required

Get these and add to .env.local:

1. **Suno API Key**
   - Visit: https://studio.suno.ai/
   - Sign up → API settings
   - Copy API key

2. **ElevenLabs API Key**
   - Visit: https://www.elevenlabs.io/
   - Sign up → API → Copy API key

3. **JWT Token** (from backend auth endpoint)
   - GET your token from: /api/auth endpoint
   - Or use test token for development

---

## File Structure

```
akfu-frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard
│   ├── campus/
│   │   └── page.tsx            # Campus map
│   ├── room/
│   │   └── [roomId]/
│   │       └── page.tsx        # Room view
│   ├── station/
│   │   └── [stationId]/
│   │       └── page.tsx        # Station detail
│   └── api/
│       ├── suno/route.ts       # Suno API bridge
│       └── elevenlabs/route.ts # ElevenLabs API bridge
├── components/
│   ├── CampusMap.tsx           # SVG map
│   ├── RoomView.tsx            # Room layout
│   ├── SunoGenerator.tsx        # Song generation
│   ├── ElevenLabsRecorder.tsx   # Voiceover
│   ├── AudioMixer.tsx           # Web Audio API mixer
│   ├── Header.tsx              # Top bar
│   └── Sidebar.tsx             # Navigation
├── lib/
│   ├── api.ts                  # Fetch wrapper
│   ├── suno.ts                 # Suno client
│   ├── elevenlabs.ts           # ElevenLabs client
│   └── audio.ts                # Web Audio utilities
├── store/
│   ├── useRoom.ts              # Room state
│   ├── useProject.ts           # Project state
│   ├── useAudio.ts             # Audio state
│   └── useProgress.ts          # Progress state
├── types/
│   └── index.ts                # TypeScript types
├── styles/
│   └── globals.css             # Tailwind
├── public/
│   └── (assets)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

---

## Features

### Campus Map
- 12 interactive building hotspots
- Hover → highlight + tooltip
- Click → navigate to room
- Responsive SVG

### Welcome Hub
- Create new project
- List projects
- Resume last project
- Room directory navigation
- Director assistant (modal)

### Sound Lab
- **WRITE SONG** → Suno.ai integration
  - Genre, mood, custom lyrics
  - Generate full song in seconds
  - Preview + save to library

- **RECORD VOICEOVER** → ElevenLabs
  - Select voice from library
  - Custom text or script
  - Generate natural voiceover
  - Download or save

- **MIX MASTER** → Web Audio API
  - Load all project audio
  - Per-track volume/pan
  - Solo/mute controls
  - Master output metering
  - Export mixed WAV

- Other stations (placeholders)

### Audio Library
- Browse all generated audio
- Play inline
- Download
- Delete
- Sort by date/type

---

## Development

```bash
# Install
npm install

# Run dev server
npm run dev

# Build for production
npm build

# Start production server
npm start
```

---

## Connected to Backend

All endpoints already wired:

```javascript
// Example: Get all rooms
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { rooms } = await response.json();
```

---

## Success Checklist

After deploying, test:

- [ ] Campus map loads with 12 buildings
- [ ] Click building → room view works
- [ ] Welcome Hub has 6 stations clickable
- [ ] Sound Lab fully interactive
- [ ] Suno song generation works (with API key)
- [ ] ElevenLabs voiceover works (with API key)
- [ ] Audio mixer loads project audio
- [ ] Export audio downloads WAV
- [ ] Progress persists on reload
- [ ] Mobile responsive (test at 375px)

---

## Status

🚀 **PRODUCTION READY**

Clone → Install → Add .env.local → Deploy → Use

