const request = require('supertest');

// Each test file gets a fresh app instance to avoid rate-limit state leaking
// between test suites. We re-require index.js inside the factory so that
// express-rate-limit counters reset.
function createApp() {
  // Clear the module cache for index.js and express-rate-limit so that
  // each test gets fresh rate-limiter instances with zeroed counters.
  delete require.cache[require.resolve('../index')];
  Object.keys(require.cache).forEach((key) => {
    if (key.includes('express-rate-limit')) {
      delete require.cache[key];
    }
  });
  return require('../index');
}

// --- Valid chat request body ---
const validBody = {
  system: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 100,
};

// -------------------------------------------------------
// POST /api/chat -- happy path
// -------------------------------------------------------
describe('POST /api/chat', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    global.fetch.mockClear();
    // Reset to default successful mock
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'msg_test_123',
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: 'Mock response' }],
          }),
        text: () => Promise.resolve('{}'),
      })
    );
  });

  test('returns 200 and proxied response with valid body', async () => {
    const res = await request(app).post('/api/chat').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'msg_test_123');
    expect(res.body).toHaveProperty('content');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Verify the fetch was called with the right URL and headers
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(opts.headers['x-api-key']).toBe('test-key-not-real');
    expect(opts.headers['anthropic-version']).toBe('2023-06-01');
  });

  test('forwards system, messages, and max_tokens to Anthropic', async () => {
    await request(app).post('/api/chat').send(validBody);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.system).toBe(validBody.system);
    expect(body.messages).toEqual(validBody.messages);
    expect(body.max_tokens).toBe(100);
  });

  test('uses default max_tokens of 1000 when not provided', async () => {
    const { max_tokens, ...bodyWithoutMax } = validBody;
    await request(app).post('/api/chat').send(bodyWithoutMax);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(1000);
  });
});

// -------------------------------------------------------
// POST /api/chat -- validation errors
// -------------------------------------------------------
describe('POST /api/chat - validation', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    global.fetch.mockClear();
  });

  test('returns 400 when messages is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ system: 'test' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/messages/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns 400 when messages is not an array', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: 'not an array' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/messages/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/chat').send({});

    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------
// POST /api/chat -- upstream API errors
// -------------------------------------------------------
describe('POST /api/chat - upstream errors', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    global.fetch.mockClear();
  });

  test('returns upstream status code when Anthropic API returns an error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        text: () => Promise.resolve('rate limited by anthropic'),
      })
    );

    const res = await request(app).post('/api/chat').send(validBody);

    expect(res.status).toBe(429);
    expect(res.body.error).toContain('429');
  });

  test('returns 500 when fetch throws a network error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('network failure'))
    );

    const res = await request(app).post('/api/chat').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/proxy/i);
  });
});

// -------------------------------------------------------
// POST /api/chat -- missing API key
// -------------------------------------------------------
describe('POST /api/chat - missing API key', () => {
  test('returns 500 when ANTHROPIC_API_KEY is not set', async () => {
    const savedKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    global.fetch.mockClear();

    try {
      const app = createApp();
      const res = await request(app).post('/api/chat').send(validBody);

      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/ANTHROPIC_API_KEY/i);
      expect(global.fetch).not.toHaveBeenCalled();
    } finally {
      process.env.ANTHROPIC_API_KEY = savedKey;
    }
  });
});

// -------------------------------------------------------
// POST /api/log
// -------------------------------------------------------
describe('POST /api/log', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('returns 200 with { ok: true }', async () => {
    const res = await request(app).post('/api/log').send({
      event: 'test_event',
      suite: 'test_suite',
      scenario: 'test_scenario',
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

// -------------------------------------------------------
// GET * -- SPA fallback
// -------------------------------------------------------
describe('GET / - static/SPA fallback', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('returns a response for the root route', async () => {
    const res = await request(app).get('/');
    // Will be 200 if client/dist/index.html exists, or 404 if not built.
    // Either way the server should respond without crashing.
    expect([200, 404]).toContain(res.status);
  });

  test('non-API routes fall through to SPA handler', async () => {
    const res = await request(app).get('/some/client/route');
    // Same expectation -- responds without error
    expect([200, 404]).toContain(res.status);
  });
});
