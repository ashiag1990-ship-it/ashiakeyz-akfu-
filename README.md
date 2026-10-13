# AKFU Frontend - Ashia Keyz Film University

Complete Next.js 14 + React 18 frontend for AKFU, the AI-powered interactive film education platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm or yarn
- GitHub account (for deployment)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ashiag1990-ship-it/akfu-frontend.git
cd akfu-frontend

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local
# Edit .env.local and add your API keys:
# - NEXT_PUBLIC_API_URL=https://ashiakeyz-akfu-production.up.railway.app
# - NEXT_PUBLIC_SUNO_API_KEY=your_suno_key
# - NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
# - NEXT_PUBLIC_AUTH_TOKEN=your_jwt_token

# 4. Run development server
npm run dev
# Open http://localhost:3000
```

## 📦 What's Included

### Architecture
- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS with custom cinematic theme
- **Web Audio API** - Professional audio mixing
- **Suno.ai Integration** - AI song generation
- **ElevenLabs Integration** - AI voiceover generation

### File Structure

```
akfu-frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard
│   ├── campus/
│   │   └── page.tsx            # Campus map view
│   ├── room/[roomId]/
│   │   └── page.tsx            # Room with stations
│   ├── station/[stationId]/
│   │   └── page.tsx            # Station detail (Sound Lab)
│   ├── api/
│   │   ├── suno/route.ts       # Suno API proxy
│   │   └── elevenlabs/route.ts # ElevenLabs API proxy
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── Header.tsx              # Top navigation
│   ├── Sidebar.tsx             # Room navigation
│   ├── CampusMap.tsx           # Interactive campus SVG
│   ├── RoomView.tsx            # Room layout
│   ├── SunoGenerator.tsx        # Song generation UI
│   ├── ElevenLabsRecorder.tsx   # Voiceover UI
│   └── AudioMixer.tsx          # Web Audio mixer
├── lib/
│   ├── api.ts                  # REST API client
│   ├── suno.ts                 # Suno.ai client
│   ├── elevenlabs.ts           # ElevenLabs client
│   └── audio.ts                # Web Audio utilities
├── store/
│   ├── useRoom.ts              # Room state
│   ├── useProject.ts           # Project state
│   ├── useAudio.ts             # Audio state
│   └── useProgress.ts          # Progress state
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/
│   └── (assets)                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## 🎨 Design System

### Colors
- **Dark Background**: `#0A0E27` (akfu-dark)
- **Purple Accent**: `#2D1B4E` (akfu-purple)
- **Cyan Highlight**: `#00D9FF` (akfu-cyan)
- **Gold Accent**: `#D4AF37` (akfu-gold)

### Typography
- Display/Body: Inter (sans-serif)
- Monospace: IBM Plex Mono

### Components
All components use Tailwind CSS utility classes with custom cinematic styling. No external UI library required.

## 🔧 Configuration

### Environment Variables

Required for production:

```env
NEXT_PUBLIC_API_URL=https://ashiakeyz-akfu-production.up.railway.app
NEXT_PUBLIC_SUNO_API_KEY=your_suno_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_AUTH_TOKEN=your_jwt_token
```

### API Keys

1. **Suno API Key**
   - Get from: https://studio.suno.ai/
   - Path: Settings → API Key → Copy

2. **ElevenLabs API Key**
   - Get from: https://www.elevenlabs.io/
   - Path: Account → API Key → Copy

3. **JWT Token**
   - Get from: Backend `/api/auth` endpoint
   - Or use test token for development

## 🚢 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts → Select project → Add environment variables → Done
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 3: Docker

```bash
# Build
docker build -t akfu-frontend .

# Run
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=... akfu-frontend
```

## 📖 Features

### Dashboard
- Create and manage projects
- View all campus rooms
- Track progress
- Quick links to campus map

### Campus Map
- 12 interactive building hotspots
- Hover effects with tooltips
- SVG-based for crisp rendering
- Click to enter room

### Sound Lab (Station)
- **Write Song**: Suno.ai integration for AI song generation
- **Record Voiceover**: ElevenLabs voice synthesis
- **Mix Master**: Web Audio API mixer with:
  - Per-track volume/pan controls
  - Master output with frequency visualizer
  - Solo/mute functionality
  - Export to WAV format

### State Management
- Zustand stores for:
  - Room/Station data
  - Project management
  - Audio playback
  - Progress tracking
  - Completion percentages

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Scripts

```json
{
  "dev": "next dev",              # Development server
  "build": "next build",          # Production build
  "start": "next start",          # Production server
  "lint": "next lint",            # Linting
  "export": "next export"         # Static export
}
```

## 🔐 Security

- TypeScript strict mode
- Secure API headers (CSP, X-Frame-Options, etc.)
- JWT token-based auth
- Environment variable validation
- No hardcoded secrets
- HTTPS enforced in production

## 📱 Responsive Design

- Mobile-first approach
- Tested at: 320px, 768px, 1024px, 1440px
- Touch-friendly buttons and interactions
- Flexible grid layouts

## ♿ Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus states visible
- Color contrast compliant
- Reduced motion respected

## 🐛 Troubleshooting

### Port 3000 in use
```bash
# Kill process using port
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### API connection errors
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running
- Verify JWT token is valid
- Check CORS headers on backend

### Suno/ElevenLabs errors
- Verify API keys are correct
- Check if API keys have rate limits
- Ensure account has available credits
- Try test request with curl

## 📚 Documentation

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Zustand**: https://zustand-demo.vercel.app
- **Tailwind**: https://tailwindcss.com/docs
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

Built for Ashia Keyz Studios

## 🎯 Roadmap

- [ ] WebRTC for real-time collaboration
- [ ] Video generation with HeyGen
- [ ] Advanced audio editing suite
- [ ] Certification/completion badges
- [ ] Community sharing & collaboration
- [ ] Mobile app (React Native)

## ✨ Status

**PRODUCTION READY** ✅

All features implemented and tested. Ready for deployment and user access.
