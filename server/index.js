const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before trying again.' },
});
app.use(generalLimiter);

// Strict rate limit for chat endpoint: 20 requests per 15 minutes per IP
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before sending another message.' },
});

// Serve static React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API proxy - keeps Anthropic key server-side
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { system, messages, max_tokens = 1000 } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'claude-sonnet-4-20250514',
        max_tokens,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Anthropic API error (${response.status}):`, errText);
      return res.status(response.status).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Internal proxy error' });
  }
});

// Log usage (simple console logging; replace with DB later if needed)
app.post('/api/log', (req, res) => {
  const { event, suite, scenario, timestamp } = req.body;
  console.log(`[USAGE] ${timestamp || new Date().toISOString()} | ${event} | ${suite} | ${scenario}`);
  res.json({ ok: true });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Only start listening when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OBLD 500 Simulation Suite running on port ${PORT}`);
  });
}

module.exports = app;
