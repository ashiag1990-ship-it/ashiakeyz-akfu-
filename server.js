const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Simple test endpoint
app.post('/api/test', (req, res) => {
  res.json({ success: true, data: req.body });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
