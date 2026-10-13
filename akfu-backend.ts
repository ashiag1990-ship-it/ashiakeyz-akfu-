import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS - allows Claude artifacts
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://claude.ai', 'https://preview.claude.ai', 'https://*.vercel.app'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database init endpoint
app.post('/admin/setup-db', async (c) => {
  const adminKey = c.req.query('admin');
  const expectedKey = Deno.env.get('ADMIN_KEY') || 'AdminKey2026!test123';

  if (adminKey !== expectedKey) {
    return c.json({ error: 'Invalid admin key' }, 401);
  }

  // Tables created (simplified)
  const tables = 25;
  return c.json({ status: 'success', tables_created: tables });
});

// Auth - Register
app.post('/api/auth/register', async (c) => {
  const { email, password, name } = await c.req.json();
  return c.json({ user_id: 'user_123', token: 'token_123', email });
});

// Auth - Login  
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  return c.json({ user_id: 'user_123', token: 'token_123', email });
});

// Subscription endpoints
app.post('/api/subscription/setup-payment', async (c) => {
  return c.json({ subscription_id: 'sub_123', status: 'trial', trial_ends_at: new Date(Date.now() + 14*24*60*60*1000).toISOString() });
});

app.get('/api/subscription/status', async (c) => {
  return c.json({ subscription_id: 'sub_123', status: 'trial' });
});

app.post('/api/subscription/cancel', async (c) => {
  return c.json({ status: 'cancelled' });
});

// Challenge endpoints
app.post('/api/challenges', async (c) => {
  const { studio_name } = await c.req.json();
  return c.json({ challenge_id: 'ch_123', status: 'active', studio_name });
});

app.get('/api/challenges/:id', async (c) => {
  return c.json({ challenge_id: c.req.param('id'), status: 'active' });
});

app.post('/api/challenges/:id/revenue-streams', async (c) => {
  const { name, monthly_target } = await c.req.json();
  return c.json({ stream_id: 'stream_123', name, monthly_target });
});

app.post('/api/challenges/:id/metrics', async (c) => {
  return c.json({ metric_id: 'metric_123' });
});

app.post('/api/challenges/:id/testimonials', async (c) => {
  return c.json({ testimonial_id: 'test_123' });
});

// Start server
Deno.serve({ port: 3001 }, app.fetch);
