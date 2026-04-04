const request = require('supertest');

// --- Valid chat request body ---
const validBody = {
  system: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 100,
};

// -------------------------------------------------------
// Rate limiting tests run in their own file to guarantee
// a clean process with no leaked rate-limiter state.
// -------------------------------------------------------
describe('POST /api/chat - rate limiting', () => {
  let app;

  beforeAll(() => {
    app = require('../index');
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'msg_test' }),
        text: () => Promise.resolve('{}'),
      })
    );
  });

  test('returns 429 after exceeding 20 requests (chat limiter)', async () => {
    // Send 20 requests sequentially (the chat limit)
    for (let i = 0; i < 20; i++) {
      const res = await request(app).post('/api/chat').send(validBody);
      expect(res.status).toBe(200);
    }

    // The 21st should be rate-limited
    const blocked = await request(app).post('/api/chat').send(validBody);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many requests/i);
  });
});
