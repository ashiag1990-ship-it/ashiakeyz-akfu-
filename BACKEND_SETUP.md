# AKFU Backend Setup

## What's Included

The backend (`backend.ts`) is a complete Bun/Hono application that handles:
- User authentication (login, password setup)
- Integration management (Suno, ElevenLabs, HiggsField)
- Encrypted credential storage
- Database initialization

## Quick Start

### Option 1: Run Locally with Bun

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Create a .env file
cat > .env << EOF
DATABASE_URL=file:./akfu.db
TOKEN_SECRET=your-secret-key-here
PORT=3000
ADMIN_PASSWORD=admin123
ENCRYPTION_KEY=your-32-byte-encryption-key-here
EOF

# Run the backend
bun run backend.ts
```

The server will start at `http://localhost:3000`

### Option 2: Deploy to Railway

#### Prerequisites:
- Railway account (https://railway.app)
- GitHub repository with backend.ts

#### Steps:

1. **Create a new Railway project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "GitHub" if you have the repo there
   - Or use "Deploy from template"

2. **Configure environment variables**
   - Go to your project settings
   - Add the following environment variables:

   ```
   DATABASE_URL=file:./akfu.db
   TOKEN_SECRET=your-super-secret-key
   PORT=3000
   ADMIN_PASSWORD=your-admin-password
   ENCRYPTION_KEY=a-32-byte-key-for-aes-256-encryption
   ```

   Important: ENCRYPTION_KEY must be exactly 32 bytes (characters) for AES-256

3. **Deploy**
   - Railway will auto-detect the Bun runtime
   - Click "Deploy"
   - Your backend is live at `your-project.up.railway.app`

### Option 3: Deploy to Other Platforms

#### Docker (Heroku, AWS, etc.)

Create a `Dockerfile`:
```dockerfile
FROM oven/bun:latest

WORKDIR /app

COPY backend.ts .
COPY package.json .

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "backend.ts"]
```

Build and deploy:
```bash
docker build -t akfu-backend .
docker run -p 3000:3000 -e DATABASE_URL=... akfu-backend
```

#### Node.js (Convert from Bun)

Install esbuild and compile to CommonJS:
```bash
npm install -D esbuild

esbuild backend.ts --bundle --platform=node --target=node18 --outfile=backend.js

node backend.js
```

---

## Environment Variables Explained

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./akfu.db` | SQLite database path (or other DB URL) |
| `TOKEN_SECRET` | Yes | `secret123key` | Secret for JWT token generation |
| `PORT` | No | `3000` | Server port (default: 3000) |
| `ADMIN_PASSWORD` | Yes | `admin123` | Password for admin endpoints |
| `ENCRYPTION_KEY` | Yes | `this-is-32-bytes-encryption-key!!!` | AES-256 encryption key (must be 32 bytes) |

**Security Note**: Change all of these from defaults in production!

---

## API Endpoints

### Authentication Endpoints

#### POST /api/course/login
Login user with email and password.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "token": "base64-encoded-token",
  "email": "student@example.com",
  "name": "Student Name"
}
```

**Response (Needs Password Setup):**
```json
{
  "needsPasswordSetup": true,
  "email": "student@example.com",
  "message": "Please create your password"
}
```

---

#### POST /api/course/set-password
Set initial password for a student.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "token": "base64-encoded-token",
  "email": "student@example.com",
  "name": "Student Name",
  "message": "Password set successfully"
}
```

---

### Integration Endpoints

#### POST /api/integrations/save
Save user's integration settings (API keys, social handles).

**Request:**
```json
{
  "project_id": "proj_123",
  "suno_api_key": "your-suno-key",
  "elevenlabs_api_key": "your-elevenlabs-key",
  "higgsfield_account": "your-higgsfield-email",
  "instagram_handle": "@yourhandle",
  "tiktok_handle": "@yourhandle",
  "youtube_handle": "@yourhandle"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Integrations saved successfully"
}
```

**Notes:**
- API keys are encrypted before storage
- Social handles are stored as plaintext
- All fields are optional

---

#### GET /api/integrations/:projectId
Retrieve user's saved integrations.

**Request:**
```
GET /api/integrations/proj_123
```

**Response:**
```json
{
  "suno_api_key": "***SET***",
  "elevenlabs_api_key": "***SET***",
  "higgsfield_account": "user@example.com",
  "instagram_handle": "@yourhandle",
  "tiktok_handle": "@yourhandle",
  "youtube_handle": "@yourhandle"
}
```

**Notes:**
- API keys shown as "***SET***" for security
- Never returns actual API keys to frontend
- Returns null for unset fields

---

#### POST /api/integrations/test/:service
Test if an API key is valid.

**Request:**
```json
{
  "apiKey": "your-api-key-here"
}
```

Service options: `suno`, `elevenlabs`, `higgsfield`

**Response (Success):**
```json
{
  "status": "success",
  "message": "suno account verified"
}
```

**Response (Failure):**
```json
{
  "error": "Invalid suno credentials"
}
```

Status code: `401`

---

### Health Check

#### GET /health
Check if backend is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Database Schema

### students table
```sql
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT,
  created INTEGER DEFAULT 0,
  courseId TEXT,
  courses JSON DEFAULT '{}'
);
```

### user_integrations table
```sql
CREATE TABLE user_integrations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  suno_api_key TEXT,
  elevenlabs_api_key TEXT,
  higgsfield_account TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  created_at INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT 0
);
```

**Notes:**
- `suno_api_key` and `elevenlabs_api_key` are stored encrypted
- Other fields are stored as plaintext
- Each project can have at most one integration record

---

## Testing Endpoints

### Test Health
```bash
curl http://localhost:3000/health
# Response: {"status":"ok"}
```

### Test Integration Save
```bash
curl -X POST http://localhost:3000/api/integrations/save \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "test_proj",
    "suno_api_key": "test-suno-key",
    "instagram_handle": "@testhandle"
  }'
```

### Test Integration Get
```bash
curl http://localhost:3000/api/integrations/test_proj
```

### Test API Key Validation
```bash
curl -X POST http://localhost:3000/api/integrations/test/suno \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-suno-api-key"}'
```

---

## Troubleshooting

### Database locked error
**Cause**: Multiple processes accessing same SQLite database
**Fix**: Ensure only one backend instance is running

### Encryption key error
**Cause**: ENCRYPTION_KEY is not 32 bytes
**Fix**: Generate valid key: `head -c 32 /dev/urandom | base64`

### Port already in use
**Cause**: Another process using port 3000
**Fix**: Change PORT in .env or kill the other process

### CORS errors
**Cause**: Frontend making requests to backend
**Fix**: Already handled - backend has CORS enabled for all origins

---

## Security Considerations

### For Production:
1. ✅ API keys are encrypted in database
2. ✅ Tokens are HMAC-signed
3. ✅ Passwords are SHA256-hashed
4. ⚠️ Change default passwords
5. ⚠️ Use strong TOKEN_SECRET
6. ⚠️ Use strong ENCRYPTION_KEY
7. ⚠️ Enable HTTPS (handled by hosting provider)
8. ⚠️ Use environment variables (don't hardcode secrets)

### Encryption Details:
- Algorithm: AES-256-CBC
- Key length: 32 bytes
- IV: Random 16 bytes per encryption
- Format: `iv:ciphertext` (hex-encoded)

---

## Monitoring

### View Logs (Railway)
```bash
railway logs
```

### View Database Contents
```bash
# Using bun
bun run -e "
import { SQL } from 'bun';
const db = new SQL('file:./akfu.db');
const users = db.query('SELECT * FROM user_integrations').all();
console.log(users);
"
```

### Check Server Status
```bash
curl -v https://your-backend.up.railway.app/health
```

---

## Scaling Considerations

### Current Setup:
- SQLite (file-based)
- Single process
- Suitable for: 1-100 concurrent users, hobby projects

### To Scale:
1. **Switch to PostgreSQL**
   - Update DATABASE_URL to PostgreSQL connection string
   - Code should work without changes (both use SQL interface)

2. **Add load balancing**
   - Run multiple backend instances
   - Use Railway's auto-scaling or similar

3. **Cache integrations**
   - Add Redis for caching
   - Reduce database hits

4. **Use managed database**
   - Railway PostgreSQL add-on
   - Automatic backups and scaling

---

## Next Steps

1. ✅ Backend code ready: `backend.ts`
2. ⏳ Deploy to Railway (15 min)
3. ⏳ Initialize database
4. ⏳ Connect frontend to backend
5. ⏳ Test integration flow

See `COMPLETE_DEPLOYMENT_GUIDE.md` for step-by-step instructions.

---

**Questions?** Check the main deployment guide or test endpoints locally first.
