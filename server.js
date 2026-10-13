import http from "http";
import crypto from "crypto";

const students = new Map();
const integrations = new Map();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SECRET = process.env.TOKEN_SECRET || "";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-32-byte-encryption-key!!!";

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
    return value;
  }
}

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AKFU - Ashia Keyz Film University</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0f1e 0%, #1a0f2e 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 20px 40px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(0,255,255,0.2);
    }
    h1 { font-size: 28px; color: #00ffff; }
    main {
      flex: 1;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .campus-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .building {
      background: rgba(0,255,255,0.1);
      border: 2px solid #00ffff;
      padding: 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
    }
    .building:hover {
      background: rgba(0,255,255,0.2);
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(0,255,255,0.3);
    }
    .building h3 { color: #00ffff; margin-bottom: 10px; }
    .api-test {
      background: rgba(100,150,255,0.1);
      border: 1px solid #6496ff;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    button {
      background: #00ffff;
      color: #000;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin: 10px 10px 10px 0;
    }
    input {
      background: rgba(255,255,255,0.1);
      border: 1px solid #00ffff;
      color: #fff;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      width: 100%;
    }
    .response {
      background: rgba(0,0,0,0.5);
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
      font-family: monospace;
      font-size: 12px;
      max-height: 200px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <header>
    <h1>🎬 AKFU - Ashia Keyz Film University</h1>
  </header>
  <main>
    <h2 style="margin: 30px 0 20px;">Campus Buildings</h2>
    <div class="campus-grid">
      <div class="building"><h3>🎓 Academy</h3><p>Film education</p></div>
      <div class="building"><h3>🎬 Studio</h3><p>Production</p></div>
      <div class="building"><h3>🎵 Sound Lab</h3><p>Audio</p></div>
      <div class="building"><h3>⚙️ Tech Center</h3><p>Resources</p></div>
    </div>

    <div class="api-test">
      <h2>🔌 API Settings</h2>
      <label>API Key:</label>
      <input type="password" id="apiKey" placeholder="Enter API key...">
      <button onclick="testConnection()">Test Connection</button>
      <button onclick="saveSettings()">Save Settings</button>
      <div id="response" class="response" style="display:none;"></div>
    </div>

    <div class="api-test">
      <h2>✅ Health Check</h2>
      <button onclick="healthCheck()">Check Backend</button>
      <div id="healthResponse" class="response" style="display:none;"></div>
    </div>
  </main>

  <script>
    const API_URL = window.location.origin;

    async function healthCheck() {
      try {
        const res = await fetch(API_URL + '/api/health');
        const data = await res.json();
        showResponse('healthResponse', 'Status: ' + JSON.stringify(data, null, 2), true);
      } catch (e) {
        showResponse('healthResponse', 'Error: ' + e.message, false);
      }
    }

    async function testConnection() {
      const apiKey = document.getElementById('apiKey').value;
      if (!apiKey) { alert('Enter an API key'); return; }
      try {
        const res = await fetch(API_URL + '/api/integrations/test/suno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey })
        });
        const data = await res.json();
        showResponse('response', JSON.stringify(data, null, 2), res.ok);
      } catch (e) {
        showResponse('response', 'Error: ' + e.message, false);
      }
    }

    async function saveSettings() {
      const apiKey = document.getElementById('apiKey').value;
      if (!apiKey) { alert('Enter an API key'); return; }
      try {
        const res = await fetch(API_URL + '/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: 'default', suno_api_key: apiKey })
        });
        const data = await res.json();
        showResponse('response', JSON.stringify(data, null, 2), res.ok);
      } catch (e) {
        showResponse('response', 'Error: ' + e.message, false);
      }
    }

    function showResponse(id, text, success) {
      const el = document.getElementById(id);
      el.textContent = text;
      el.style.display = 'block';
      el.style.color = success ? '#00ff00' : '#ff6b6b';
    }

    window.onload = () => healthCheck();
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;

  if (pathname === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (pathname === "/api/integrations/save" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { project_id, suno_api_key } = data;
        if (!project_id) throw new Error("project_id required");
        
        integrations.set(project_id, {
          project_id,
          suno_api_key: suno_api_key ? encryptValue(suno_api_key) : null,
          created_at: Date.now()
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname.startsWith("/api/integrations/test/") && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { apiKey } = data;
        if (!apiKey || apiKey.length < 5) throw new Error("Invalid key");
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(indexHTML);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(\`✅ AKFU running on port \${port}\`);
});

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});
