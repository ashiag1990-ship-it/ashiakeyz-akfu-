# AKFU Student Integrations - Architecture

## User-Owned Accounts System

Each student brings their own API keys and links them through Settings.

### Backend Schema Addition

```sql
CREATE TABLE akfu_user_integrations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  suno_api_key TEXT,           -- Encrypted
  elevenlabs_api_key TEXT,     -- Encrypted
  higgsfield_account TEXT,     -- Encrypted
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES akfu_projects(id)
);
```

### Backend Endpoints (New)

```
POST /api/integrations/save
  - Save user's API keys (encrypted)
  - Body: { suno_key, elevenlabs_key, higgsfield, social_handles }

GET /api/integrations/:projectId
  - Retrieve user's integration settings

POST /api/integrations/test/:service
  - Test if API key works
  - Body: { apiKey }

DELETE /api/integrations/:projectId/:service
  - Remove linked account
```

### Frontend Pages (New)

1. **Settings Page** (`app/settings/page.tsx`)
   - Integrations section
   - Forms for each service
   - Social media links
   - Affiliate signup buttons

2. **Onboarding/Signup** (Update)
   - Show signup flow with affiliate links
   - "Sign up for Suno" → Your affiliate link
   - "Sign up for ElevenLabs" → Your affiliate link
   - "Sign up for HiggsField" → Your affiliate link

3. **Feature Gating**
   - Song generator: Check if Suno key linked
   - Voiceover: Check if ElevenLabs key linked
   - Video: Check if HiggsField linked
   - Show "Link Account" button if missing

### API Proxy Updates

Current: Backend gets API key from env, uses it for all users
New: Backend gets API key from user's saved integrations, uses that

```
POST /api/suno/generate
  - Reads user's Suno key from integrations
  - Uses that key to call Suno API
  - Returns result to student
```

### Encryption

Use backend encryption (e.g., crypto.subtle or bcrypt) to store keys safely.

Never expose keys to frontend.
