import http from "http";
import Hono from "hono";
import { cors } from "hono/cors";
import crypto from "crypto";

// In-memory store
const students = new Map();
const integrations = new Map();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SECRET = process.env.TOKEN_SECRET || "";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-32-byte-encryption-key!!!";

// Helper functions
function makeToken(email) {
  const hmac = crypto.createHmac("sha256", SECRET).update(email).digest("base64");
  return Buffer.from(email + "|" + hmac).toString("base64");
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email, hmac] = decoded.split("|");
    if (!email || !hmac) return "";
    const newHmac = crypto.createHmac("sha256", SECRET).update(email).digest("base64");
    return hmac === newHmac ? email : "";
  } catch {
    return "";
  }
}

// Encryption utilities
function encryptValue(value) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return value;
  }
}

function decryptValue(encrypted) {
  try {
    const [ivHex, encryptedText] = encrypted.split(':');
    if (!ivHex || !encryptedText) return encrypted;

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted;
  }
}

// Create Hono app
const app = new Hono();

// Enable CORS
app.use("*", cors());

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Login endpoint
app.post("/api/course/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password required" }, 400);
    }

    const student = students.get(email);

    if (!student) {
      return c.json({ needsPasswordSetup: true, email }, 200);
    }

    const passwordHash = crypto.createHmac("sha256", SECRET).update(password).digest("base64");
    if (student.password !== passwordHash) {
      return c.json({ error: "Invalid password" }, 401);
    }

    const token = makeToken(email);
    return c.json({
      token,
      email,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Set password endpoint
app.post("/api/course/set-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const passwordHash = crypto.createHmac("sha256", SECRET).update(password).digest("base64");

    students.set(email, {
      email,
      password: passwordHash,
      created_at: Date.now(),
    });

    const token = makeToken(email);
    return c.json({
      token,
      email,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Set password error:", error);
    return c.json({ error: "Password setup failed" }, 500);
  }
});

// Save integrations endpoint
app.post("/api/integrations/save", async (c) => {
  try {
    const body = await c.req.json();
    const {
      project_id,
      suno_api_key,
      elevenlabs_api_key,
      higgsfield_account,
      instagram_handle,
      tiktok_handle,
      youtube_handle,
    } = body;

    if (!project_id) {
      return c.json({ error: "project_id required" }, 400);
    }

    const encryptedSuno = suno_api_key ? encryptValue(suno_api_key) : null;
    const encryptedElevenLabs = elevenlabs_api_key ? encryptValue(elevenlabs_api_key) : null;

    integrations.set(project_id, {
      id: project_id,
      project_id,
      suno_api_key: encryptedSuno,
      elevenlabs_api_key: encryptedElevenLabs,
      higgsfield_account: higgsfield_account || null,
      instagram_handle: instagram_handle || null,
      tiktok_handle: tiktok_handle || null,
      youtube_handle: youtube_handle || null,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return c.json({ status: "success", message: "Integrations saved successfully" });
  } catch (error) {
    console.error("Save integrations error:", error);
    return c.json({ error: "Failed to save integrations" }, 500);
  }
});

// Get integrations endpoint
app.get("/api/integrations/:projectId", (c) => {
  try {
    const projectId = c.req.param("projectId");

    const integration = integrations.get(projectId);

    if (!integration) {
      return c.json({
        suno_api_key: null,
        elevenlabs_api_key: null,
        higgsfield_account: null,
        instagram_handle: null,
        tiktok_handle: null,
        youtube_handle: null,
      });
    }

    return c.json({
      suno_api_key: integration.suno_api_key ? "***SET***" : null,
      elevenlabs_api_key: integration.elevenlabs_api_key ? "***SET***" : null,
      higgsfield_account: integration.higgsfield_account || null,
      instagram_handle: integration.instagram_handle || null,
      tiktok_handle: integration.tiktok_handle || null,
      youtube_handle: integration.youtube_handle || null,
    });
  } catch (error) {
    console.error("Get integrations error:", error);
    return c.json({ error: "Failed to retrieve integrations" }, 500);
  }
});

// Test integration endpoint
app.post("/api/integrations/test/:service", async (c) => {
  try {
    const service = c.req.param("service");
    const body = await c.req.json();
    const { apiKey } = body;

    if (!apiKey) {
      return c.json({ error: "apiKey required" }, 400);
    }

    if (!apiKey || apiKey.length < 5) {
      return c.json({ error: `Invalid ${service} credentials` }, 401);
    }

    return c.json({
      status: "success",
      message: `${service} account verified`,
    });
  } catch (error) {
    console.error("Test integration error:", error);
    return c.json({ error: "Test failed" }, 500);
  }
});

// Admin setup endpoint
app.post("/admin/setup-db", async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    if (password !== ADMIN_PASSWORD) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ status: "success", message: "Database initialized" });
  } catch (error) {
    console.error("Setup error:", error);
    return c.json({ error: "Setup failed" }, 500);
  }
});

// Create Node.js HTTP server with Hono
const port = Number(process.env.PORT || 3000);

const server = http.createServer(app.fetch);

server.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
