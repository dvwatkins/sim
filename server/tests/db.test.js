const request = require('supertest');

// --- Mock pg pool ---
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Mutable flag to control isAvailable() per test suite
// Must be prefixed with "mock" so jest.mock() factory can reference it
let mockDbAvailable = true;

// Mock the db module before requiring the app
jest.mock('../db', () => ({
  getPool: () => (mockDbAvailable ? mockPool : null),
  isAvailable: () => mockDbAvailable,
  initSchema: jest.fn().mockResolvedValue(true),
  setPool: jest.fn(),
}));

// Fresh app per suite (clears rate-limit state)
function createApp() {
  delete require.cache[require.resolve('../index')];
  Object.keys(require.cache).forEach((key) => {
    if (key.includes('express-rate-limit')) {
      delete require.cache[key];
    }
  });
  return require('../index');
}

// -------------------------------------------------------
// POST /api/sessions
// -------------------------------------------------------
describe('POST /api/sessions', () => {
  let app;

  beforeEach(() => {
    mockDbAvailable = true;
    app = createApp();
    mockQuery.mockReset();
  });

  test('creates a session and returns id + started_at', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, started_at: '2026-04-03T00:00:00Z' }],
    });

    const res = await request(app)
      .post('/api/sessions')
      .send({ student_id: 'stu123', scenario_key: 'scenario-1', mode: 'sim' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, started_at: '2026-04-03T00:00:00Z' });
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sim_sessions'),
      ['stu123', 'scenario-1', 'sim']
    );
  });

  test('returns 400 when scenario_key is missing', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ student_id: 'stu123', mode: 'sim' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/scenario_key/);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('returns 400 when mode is missing', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ scenario_key: 'scenario-1' });

    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('handles null student_id gracefully', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 2, started_at: '2026-04-03T01:00:00Z' }],
    });

    const res = await request(app)
      .post('/api/sessions')
      .send({ scenario_key: 'scenario-2', mode: 'obs' });

    expect(res.status).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sim_sessions'),
      [null, 'scenario-2', 'obs']
    );
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app)
      .post('/api/sessions')
      .send({ scenario_key: 'scenario-1', mode: 'sim' });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/connection refused/);
  });
});

// -------------------------------------------------------
// POST /api/sessions/:id/scores
// -------------------------------------------------------
describe('POST /api/sessions/:id/scores', () => {
  let app;

  beforeEach(() => {
    mockDbAvailable = true;
    app = createApp();
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
  });

  test('inserts scores and marks session completed', async () => {
    const scores = [
      { dimension: 'communication', score: 3, feedback: 'Excellent' },
      { dimension: 'empathy', score: 2 },
    ];

    const res = await request(app)
      .post('/api/sessions/1/scores')
      .send({ scores });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    // 2 score inserts + 1 completed_at update = 3 queries
    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sim_scores'),
      ['1', 'communication', 3, 'Excellent']
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sim_scores'),
      ['1', 'empathy', 2, null]
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE sim_sessions SET completed_at'),
      ['1']
    );
  });

  test('returns 400 when scores is not an array', async () => {
    const res = await request(app)
      .post('/api/sessions/1/scores')
      .send({ scores: 'not-an-array' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/scores array/);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('fk violation'));

    const res = await request(app)
      .post('/api/sessions/999/scores')
      .send({ scores: [{ dimension: 'x', score: 1 }] });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/fk violation/);
  });
});

// -------------------------------------------------------
// POST /api/sessions/:id/transcript
// -------------------------------------------------------
describe('POST /api/sessions/:id/transcript', () => {
  let app;

  beforeEach(() => {
    mockDbAvailable = true;
    app = createApp();
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
  });

  test('inserts transcript messages', async () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];

    const res = await request(app)
      .post('/api/sessions/1/transcript')
      .send({ messages });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sim_transcripts'),
      ['1', 'user', 'Hello']
    );
  });

  test('returns 400 when messages is not an array', async () => {
    const res = await request(app)
      .post('/api/sessions/1/transcript')
      .send({ messages: 'string' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/messages array/);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('disk full'));

    const res = await request(app)
      .post('/api/sessions/1/transcript')
      .send({ messages: [{ role: 'user', content: 'test' }] });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/disk full/);
  });
});

// -------------------------------------------------------
// GET /api/students/:id/history
// -------------------------------------------------------
describe('GET /api/students/:id/history', () => {
  let app;

  beforeEach(() => {
    mockDbAvailable = true;
    app = createApp();
    mockQuery.mockReset();
  });

  test('returns session history with scores', async () => {
    const mockRows = [
      {
        id: 1,
        scenario_key: 'scenario-1',
        mode: 'sim',
        started_at: '2026-04-01T00:00:00Z',
        completed_at: '2026-04-01T00:30:00Z',
        scores: [{ dimension: 'communication', score: 3, feedback: 'Good' }],
      },
    ];
    mockQuery.mockResolvedValueOnce({ rows: mockRows });

    const res = await request(app).get('/api/students/stu123/history');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRows);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('FROM sim_sessions'),
      ['stu123']
    );
  });

  test('returns empty array for unknown student', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/students/nobody/history');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('timeout'));

    const res = await request(app).get('/api/students/stu123/history');

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/timeout/);
  });
});

// -------------------------------------------------------
// 503 when DATABASE_URL not set (db unavailable)
// -------------------------------------------------------
describe('Database endpoints without DATABASE_URL', () => {
  let app;

  beforeEach(() => {
    mockDbAvailable = false;
    app = createApp();
    mockQuery.mockReset();
    // Ensure fetch mock is available for the chat test
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'msg_test_123',
            type: 'message',
            content: [{ type: 'text', text: 'Mock' }],
          }),
        text: () => Promise.resolve('{}'),
      })
    );
  });

  test('POST /api/sessions returns 503', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ scenario_key: 'test', mode: 'sim' });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/Database not configured/);
  });

  test('POST /api/sessions/:id/scores returns 503', async () => {
    const res = await request(app)
      .post('/api/sessions/1/scores')
      .send({ scores: [] });
    expect(res.status).toBe(503);
  });

  test('POST /api/sessions/:id/transcript returns 503', async () => {
    const res = await request(app)
      .post('/api/sessions/1/transcript')
      .send({ messages: [] });
    expect(res.status).toBe(503);
  });

  test('GET /api/students/:id/history returns 503', async () => {
    const res = await request(app).get('/api/students/test/history');
    expect(res.status).toBe(503);
  });

  test('POST /api/chat still works without database', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'Hello' }] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});
