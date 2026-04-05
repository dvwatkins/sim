# OBLD 500 Leadership Simulation Suite

AI-powered observation and practice simulations for OBLD 500 (Leadership in Organizations) at Embry-Riddle Aeronautical University.

## What This Is

54 AI scenarios across 9 weeks:
- **27 Observations** (Phase 3): AI-generated demonstration conversations with key moment annotations and perspective shifts
- **27 Simulations** (Phase 4): Interactive conversations with AI characters who respond to student behavior, followed by automated 6-dimension rubric scoring

81 unique characters. Zero name collisions. 3 scenarios per week per activity type.

## Architecture

```
sim-ldrcoach/
  client/           React frontend (Vite build)
    src/
      App.jsx        Unified landing page + router
      suites/        4 suite components (27 simulations + 27 observations)
  server/           Express API proxy + persistence
    index.js         Proxies /api/chat to Anthropic, persistence endpoints, rate limiting
  nginx/            Reverse proxy config for sim.ldrcoach.com
  setup.sh          Droplet provisioning script
```

## Deployment (DigitalOcean Droplet)

### Prerequisites
- A DigitalOcean droplet (Ubuntu 24.04, $6/month Basic plan is sufficient)
- An Anthropic API key (console.anthropic.com)
- DNS access to add an A record for sim.ldrcoach.com

### Steps

1. **Create droplet** in DigitalOcean (Ubuntu 24.04, Basic $6/month, any region)

2. **Upload this directory** to the droplet:
   ```bash
   scp -r sim-ldrcoach root@YOUR_DROPLET_IP:/root/
   ```

3. **Run setup**:
   ```bash
   ssh root@YOUR_DROPLET_IP
   cd /root/sim-ldrcoach
   bash setup.sh
   ```

4. **Add your API key**:
   ```bash
   nano /opt/obld500-sim/server/.env
   # Set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

5. **Configure DNS**: Add an A record for `sim.ldrcoach.com` pointing to the droplet IP

6. **Set up nginx + SSL**:
   ```bash
   cp /opt/obld500-sim/nginx/sim.ldrcoach.com.conf /etc/nginx/sites-available/
   ln -s /etc/nginx/sites-available/sim.ldrcoach.com.conf /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   certbot --nginx -d sim.ldrcoach.com
   ```

7. **Start the app**:
   ```bash
   cd /opt/obld500-sim/server
   pm2 start index.js --name obld500-sim
   pm2 save
   pm2 startup
   ```

8. **Verify**: Visit https://sim.ldrcoach.com

## Local Development

```bash
# Terminal 1: Start server
cd server
cp ../.env.example .env
# Edit .env with your API key
npm install
npm run dev

# Terminal 2: Start client (auto-proxies /api to server)
cd client
npm install
npm run dev
# Open http://localhost:5173
```

## Updating Scenarios

All scenario data (character profiles, behavior rules, rubric dimensions) is in the suite JSX files under `client/src/suites/`. Edit the SCENARIOS or OBS objects, then rebuild:

```bash
cd /opt/obld500-sim/client
npm run build
# No server restart needed (static files)
```

## Security

- **Rate limiting** via `express-rate-limit` in the server:
  - POST `/api/chat`: 20 requests / 15 min
  - General routes: 100 requests / 15 min

## Testing

- **Framework:** Jest + supertest (32 tests)
- **Run:** `cd server && npm test`
- **Mocking:** Tests mock the Anthropic API client and `pg` pool. No live services required.

## CI/CD

- **GitHub Actions:** `.github/workflows/ci.yml` runs the server Jest tests on push/PR to `main`.

## Persistence (PostgreSQL)

Session data is optionally stored in PostgreSQL. Requires `DATABASE_URL` env var. If not set, the server returns 503 for persistence endpoints -- existing `/api/chat` still works without a database.

**Tables:**
- `sim_sessions` -- session metadata (student, scenario, timestamps)
- `sim_scores` -- 6-dimension rubric scores per session
- `sim_transcripts` -- full conversation transcripts

**Endpoints:**
- `POST /api/sessions` -- create a new session
- `POST /api/sessions/:id/scores` -- save rubric scores
- `POST /api/sessions/:id/transcript` -- save conversation transcript
- `GET /api/students/:id/history` -- retrieve student session history

## API Costs

Each simulation conversation costs approximately $0.02-0.05 in API calls. Observation generation costs ~$0.03 per generation. For a class of 25 students completing all scenarios once: ~$30-50 total for the semester.

## Canvas Integration

The Practice tab in each training plan links to this suite. Students:
1. Click "Launch AI Observation" or "Launch AI Simulation" (opens sim.ldrcoach.com)
2. Complete the AI activity (formative, ungraded)
3. Return to Canvas and submit their written reflection (summative, graded)

The AI rubric scoring is formative feedback for learning. The Canvas assignment is the graded artifact.

---
OBLD 500: Leadership in Organizations | Dr. Daryl Watkins | Embry-Riddle Aeronautical University
