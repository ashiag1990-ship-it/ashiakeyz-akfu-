import { Hono } from "hono";
import { cors } from "hono/cors";
import { SQL } from "bun";
import * as crypto from "crypto";

const db = new SQL(Bun.env.DATABASE_URL!);
const ADMIN_PASSWORD = Bun.env.ADMIN_PASSWORD || "";
const SECRET = Bun.env.TOKEN_SECRET || "";
const SG_KEY = Bun.env.SENDGRID_API_KEY || "";
const SG_LIST = Bun.env.SENDGRID_LIST_ID || "";
const ENCRYPTION_KEY = Bun.env.ENCRYPTION_KEY || "default-32-byte-encryption-key!!!";

// Prices and constants
const AKS_PRICE = 34900;
const AL_PRICE = 29700;
const LICENSE_PRICE = 120000;
const NDA_VER = "2026-10-01";
const LIC_VER = "2026-10-02";
const COMMISSION = 0.10;
const FREE_MODULE = "intro";
const PAYOUTS = ["PayPal", "Cash App", "Zelle"];

// Helper functions
const money = (c: number) => "$" + (Number(c || 0) / 100).toFixed(2);

function makeToken(email: string): string {
  const hmac = new Bun.CryptoHasher("sha256").update(email + SECRET).digest("base64");
  return Buffer.from(email + "|" + hmac).toString("base64");
}

function verifyToken(token: string): string {
  const decoded = Buffer.from(token, "base64").toString("utf-8");
  const [email, hmac] = decoded.split("|");
  if (!email || !hmac) return "";
  const newHmac = new Bun.CryptoHasher("sha256").update(email + SECRET).digest("base64");
  return hmac === newHmac ? email : "";
}

// Encryption utilities
function encryptValue(value: string): string {
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
    return value; // Fallback to plaintext if encryption fails
  }
}

function decryptValue(encrypted: string): string {
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
    return encrypted; // Return encrypted value if decryption fails
  }
}

// Types
interface Account {
  id: string;
  email: string;
  created: number;
  name: string;
  courseId: string;
  licenseId: string;
  courses: string[];
  licenses: string[]
}

interface Student {
  id: string;
  email: string;
  created: number;
  name: string;
  courseId: string;
  courses: Record<string, { paidAt: number; seatId: string }>
}

interface Affiliate {
  email: string;
  paidAt: number;
  totalEarned: number;
  totalCommissions: number;
  claimedAt: number;
  claimedAmount: number
}

interface License {
  id: string;
  name: string;
  studentCount: number;
  seatLimit: number;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  paidAt: number;
  key: string;
  seatRequests: string[]
}

interface UserIntegrations {
  project_id: string;
  suno_api_key?: string;
  elevenlabs_api_key?: string;
  higgsfield_account?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string;
}

const app = new Hono();
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "PUT", "DELETE"] }));

// ============== LOGIN ENDPOINT ==============
app.post("/api/course/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email) {
      return c.json({ message: "Email required" }, 400);
    }

    const lowerEmail = email.toLowerCase();

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lowerEmail)) {
      return c.json({ message: "The string did not match the expected pattern" }, 400);
    }

    // Query database for student
    const student = Array.from(
      db.query("SELECT id, email, name, password FROM students WHERE email = ?", [lowerEmail]).all() as any[]
    )[0];

    if (!student) {
      return c.json({ message: "Email not found" }, 401);
    }

    // If no password set yet, prompt user to create one
    if (!student.password) {
      return c.json({
        needsPasswordSetup: true,
        email: lowerEmail,
        name: student.name || email,
        message: "Please create your password"
      }, 200);
    }

    // If password provided, validate it
    if (!password) {
      return c.json({
        message: "Password required"
      }, 400);
    }

    // Validate password using HMAC
    const passwordHash = new Bun.CryptoHasher("sha256").update(password + SECRET).digest("base64");
    if (passwordHash !== student.password) {
      return c.json({ message: "Invalid password" }, 401);
    }

    // Generate auth token
    const token = makeToken(lowerEmail);

    return c.json({
      token,
      email: lowerEmail,
      name: student.name || email
    });
  } catch (e) {
    console.error("Login error:", e);
    return c.json({ message: "Server error" }, 500);
  }
});

// ============== SET PASSWORD ENDPOINT ==============
app.post("/api/course/set-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ message: "Email and password required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ message: "Password must be at least 6 characters" }, 400);
    }

    const lowerEmail = email.toLowerCase();

    // Check student exists
    const student = Array.from(
      db.query("SELECT id, email, name FROM students WHERE email = ?", [lowerEmail]).all() as any[]
    )[0];

    if (!student) {
      return c.json({ message: "Email not found" }, 404);
    }

    // Hash password
    const passwordHash = new Bun.CryptoHasher("sha256").update(password + SECRET).digest("base64");

    // Update password in database
    db.run("UPDATE students SET password = ? WHERE email = ?", [passwordHash, lowerEmail]);

    // Generate auth token
    const token = makeToken(lowerEmail);

    return c.json({
      token,
      email: lowerEmail,
      name: student.name || email,
      message: "Password set successfully"
    });
  } catch (e) {
    console.error("Set password error:", e);
    return c.json({ message: "Server error" }, 500);
  }
});

// ============== INTEGRATIONS ENDPOINTS ==============

// Initialize integrations table
function initIntegrationsTable() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_integrations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        suno_api_key TEXT,
        elevenlabs_api_key TEXT,
        higgsfield_account TEXT,
        instagram_handle TEXT,
        tiktok_handle TEXT,
        youtube_handle TEXT,
        created_at INTEGER DEFAULT 0,
        updated_at INTEGER DEFAULT 0,
        UNIQUE(project_id)
      );
    `);
  } catch (e) {
    console.error("Error initializing integrations table:", e);
  }
}

// Save user integrations
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
      youtube_handle
    } = body;

    if (!project_id) {
      return c.json({ error: "project_id is required" }, 400);
    }

    const id = `int_${project_id}_${Date.now()}`;
    const now = Date.now();

    // Encrypt sensitive data
    const encryptedSunoKey = suno_api_key ? encryptValue(suno_api_key) : null;
    const encryptedElevenLabsKey = elevenlabs_api_key ? encryptValue(elevenlabs_api_key) : null;

    // Check if integrations already exist for this project
    const existing = Array.from(
      db.query("SELECT id FROM user_integrations WHERE project_id = ?", [project_id]).all() as any[]
    )[0];

    if (existing) {
      // Update existing
      db.run(`
        UPDATE user_integrations SET
          suno_api_key = ?,
          elevenlabs_api_key = ?,
          higgsfield_account = ?,
          instagram_handle = ?,
          tiktok_handle = ?,
          youtube_handle = ?,
          updated_at = ?
        WHERE project_id = ?
      `, [
        encryptedSunoKey,
        encryptedElevenLabsKey,
        higgsfield_account || null,
        instagram_handle || null,
        tiktok_handle || null,
        youtube_handle || null,
        now,
        project_id
      ]);
    } else {
      // Insert new
      db.run(`
        INSERT INTO user_integrations (
          id, project_id, suno_api_key, elevenlabs_api_key,
          higgsfield_account, instagram_handle, tiktok_handle, youtube_handle,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        project_id,
        encryptedSunoKey,
        encryptedElevenLabsKey,
        higgsfield_account || null,
        instagram_handle || null,
        tiktok_handle || null,
        youtube_handle || null,
        now,
        now
      ]);
    }

    return c.json({
      status: "success",
      message: "Integrations saved successfully"
    });
  } catch (e) {
    console.error("Integrations save error:", e);
    return c.json({ error: "Failed to save integrations", details: String(e) }, 500);
  }
});

// Get user integrations
app.get("/api/integrations/:projectId", async (c) => {
  try {
    const projectId = c.req.param("projectId");

    if (!projectId) {
      return c.json({ error: "projectId is required" }, 400);
    }

    const record = Array.from(
      db.query(
        `SELECT suno_api_key, elevenlabs_api_key, higgsfield_account,
                instagram_handle, tiktok_handle, youtube_handle
         FROM user_integrations WHERE project_id = ?`,
        [projectId]
      ).all() as any[]
    )[0];

    if (!record) {
      return c.json({
        suno_api_key: null,
        elevenlabs_api_key: null,
        higgsfield_account: null,
        instagram_handle: null,
        tiktok_handle: null,
        youtube_handle: null
      });
    }

    // Decrypt sensitive data for response (don't send encrypted keys to frontend)
    return c.json({
      suno_api_key: record.suno_api_key ? "***SET***" : null,
      elevenlabs_api_key: record.elevenlabs_api_key ? "***SET***" : null,
      higgsfield_account: record.higgsfield_account || null,
      instagram_handle: record.instagram_handle || null,
      tiktok_handle: record.tiktok_handle || null,
      youtube_handle: record.youtube_handle || null
    });
  } catch (e) {
    console.error("Integrations get error:", e);
    return c.json({ error: "Failed to retrieve integrations" }, 500);
  }
});

// Test service integration
app.post("/api/integrations/test/:service", async (c) => {
  try {
    const service = c.req.param("service");
    const body = await c.req.json();
    const { apiKey } = body;

    if (!apiKey) {
      return c.json({ error: "apiKey is required" }, 400);
    }

    let isValid = false;

    if (service === "suno") {
      // Test Suno API key
      try {
        const response = await fetch("https://api.suno.ai/api/clips", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        });
        isValid = response.status !== 401;
      } catch (e) {
        isValid = false;
      }
    } else if (service === "elevenlabs") {
      // Test ElevenLabs API key
      try {
        const response = await fetch("https://api.elevenlabs.io/v1/voices", {
          method: "GET",
          headers: {
            "xi-api-key": apiKey
          }
        });
        isValid = response.status !== 401;
      } catch (e) {
        isValid = false;
      }
    } else if (service === "higgsfield") {
      // Basic validation for HiggsField
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(apiKey) || apiKey.length > 3;
    }

    if (isValid) {
      return c.json({ status: "success", message: `${service} account verified` });
    } else {
      return c.json({ error: `Invalid ${service} credentials` }, 401);
    }
  } catch (e) {
    console.error("Integration test error:", e);
    return c.json({ error: "Failed to test integration" }, 500);
  }
});

// ============== ADMIN ENDPOINTS ==============
app.post("/admin/shell", async (c) => {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD !== c.req.query("admin")) {
    return c.json({ error: "Unauthorized" });
  }
  const { title, body } = await c.req.json();
  return c.json({ ok: true });
});

// Setup database endpoint
app.post("/admin/setup-db", async (c) => {
  const adminKey = c.req.query("admin");
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD !== adminKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Helper to hash passwords
    const hashPassword = (pwd: string) =>
      new Bun.CryptoHasher("sha256").update(pwd + SECRET).digest("base64");

    // Create students table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        created INTEGER DEFAULT 0,
        courseId TEXT,
        courses JSON DEFAULT '{}'
      );
    `);

    // Initialize integrations table
    initIntegrationsTable();

    // Insert students - only admin has password pre-set
    const adminPasswordHash = hashPassword("Business2025$");
    const students = [
      { id: "s-1", email: "aliqays240@gmail.com", password: null, name: "Aliqays" },
      { id: "s-2", email: "einolem39@gmail.com", password: null, name: "Einolem" },
      { id: "admin-1", email: "films@ashiakeyz.com", password: adminPasswordHash, name: "Admin" }
    ];

    const results = [];
    for (const student of students) {
      try {
        db.run(
          `INSERT INTO students (id, email, password, name, created) VALUES (?, ?, ?, ?, ?)`,
          [student.id, student.email, student.password, student.name, Date.now()]
        );
        const status = student.password ? "created with password" : "created (needs password setup)";
        results.push({ email: student.email, status });
      } catch (e) {
        results.push({ email: student.email, status: "already_exists" });
      }
    }

    return c.json({
      status: "success",
      message: "Database setup complete",
      results
    });
  } catch (e) {
    console.error("Setup error:", e);
    return c.json({ error: "Setup failed", details: String(e) }, 500);
  }
});

// ============== HEALTH CHECK ==============
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize tables on startup
initIntegrationsTable();

export default {
  port: Number(Bun.env.PORT || 3000),
  fetch: app.fetch
};
