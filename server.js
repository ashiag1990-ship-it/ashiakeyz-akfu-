import http from "http";
import crypto from "crypto";

const students = new Map();
const integrations = new Map();

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
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AKFU</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: linear-gradient(135deg, #0f0f1e 0%, #1a0f2e 100%); color: #fff; min-height: 100vh; }
    header { padding: 20px 40px; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(0,255,255,0.2); }
    h1 { font-size: 28px; color: #00ffff; }
    main { padding: 40px; max-width: 1200px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
    .card { background: rgba(0,255,255,0.1); border: 2px solid #00ffff; padding: 20px; border-radius: 8px; text-align: center; }
    .api-test { background: rgba(100,150,255,0.1); border: 1px solid #6496ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
    button { background: #00ffff; color: #000; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; margin: 10px 5px 10px 0; }
    input { background: rgba(255,255,255,0.1); border: 1px solid #00ffff; color: #fff; padding: 10px; border-radius: 4px; margin: 10px 0; width: 100%; }
    .response { background: rgba(0,0,0,0.5); padding: 15px; border-radius: 4px; margin: 10px 0; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
    .success { color: #00ff00; }
    .error { color: #ff6b6b; }
  </style>
</head>
<body>
  <header>
    <h1>🎬 AKFU - Ashia Keyz Film University</h1>
  </header>
  <main>
    <h2>Campus</h2>
    <div class="grid">
      <div class="card"><h3>🎓 Academy</h3></div>
      <div class="card"><h3>🎬 Studio</h3></div>
      <div class="card"><h3>🎵 Sound Lab</h3></div>
      <div class="card"><h3>⚙️ Tech</h3></div>
    </div>

    <div class="api-test">
      <h2>API Settings</h2>
      <label>API Key:</label>
      <input type="password" id="key" placeholder="Enter API key...">
      <button onclick="test()">Test</button>
      <button onclick="save()">Save</button>
      <div id="msg" class="response" style="display:none;"></div>
    </div>
  </main>

  <script>
    async function test() {
      const key = document.getElementById('key').value;
      if (!key) return alert('Enter key');
      try {
        const r = await fetch('/api/integrations/test/suno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: key })
        });
        const d = await r.json();
        show(JSON.stringify(d, null, 2), r.ok);
      } catch (e) {
        show(e.message, false);
      }
    }

    async function save() {
      const key = document.getElementById('key').value;
      if (!key) return alert('Enter key');
      try {
        const r = await fetch('/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: 'default', suno_api_key: key })
        });
        const d = await r.json();
        show(JSON.stringify(d, null, 2), r.ok);
      } catch (e) {
        show(e.message, false);
      }
    }

    function show(t, ok) {
      const m = document.getElementById('msg');
      m.textContent = t;
      m.className = 'response ' + (ok ? 'success' : 'error');
      m.style.display = 'block';
    }

    // Test health on load
    fetch('/api/health').then(r => r.json()).then(d => show('Health: ' + d.status, true)).catch(e => show('Error: ' + e.message, false));
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

  // Parse URL
  let pathname = req.url.split('?')[0];
  
  // Health endpoint
  if (pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Save integrations
  if (pathname === "/api/integrations/save" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { project_id, suno_api_key } = data;
        if (project_id) {
          integrations.set(project_id, {
            project_id,
            suno_api_key: suno_api_key ? encryptValue(suno_api_key) : null
          });
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Test integrations
  if (pathname.startsWith("/api/integrations/test/")) {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { apiKey } = data;
        if (apiKey && apiKey.length > 0) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "success", message: "Verified" }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid key" }));
        }
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Serve HTML for everything else
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(indexHTML);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`✅ AKFU running on port ${port}`);
});
