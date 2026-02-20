# AccessER

**Accessibility-Adjusted Emergency Room Burden Platform**

AccessER is a real-time accessibility equity layer for emergency departments. It models how ER wait times disproportionately burden patients with functional accessibility needs and provides frontline staff and administrators with actionable insights to reduce inequity — without replacing triage or making clinical decisions.

---

## Architecture

```
HackEd/
├── backend/          # NestJS API (Node.js + TypeScript)
├── frontend/         # Angular SPA
├── docker-compose.yml
├── package.json      # Monorepo scripts
└── README.md
```

### Backend (NestJS)

- **Base URL**: `http://localhost:3000/api`
- **Endpoints**:
  - `GET /health` — Health check
  - `GET /wait-times/facilities` — ER facilities (AHS data placeholder)
  - `GET /wait-times/current` — Current wait times
  - `GET /accessibility-profiles/templates` — Profile templates
  - `POST /accessibility-profiles/compute` — Compute vulnerability multiplier
  - `POST /burden-modeling/compute` — Compute burden curves
  - `POST /check-in` — Submit 20-min check-in

### Frontend (Angular)

- **Routes**:
  - `/patient` — Patient Accessibility Intake
  - `/staff` — Staff Real-Time Burden Dashboard
  - `/admin` — Administrator Equity Simulator

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
# Install all dependencies
npm run install:all

# Terminal 1: Start backend
npm run start:backend

# Terminal 2: Start frontend
npm run start:frontend
```

- **API**: http://localhost:3000/api
- **Frontend**: http://localhost:4200

### Docker

```bash
docker-compose up --build
```

- **API**: http://localhost:3000
- **Frontend**: http://localhost:4200 (proxied to backend)

---

## Development

| Command | Description |
|---------|-------------|
| `npm run backend` | Start backend in dev mode |
| `npm run frontend` | Start Angular dev server |
| `npm run backend:build` | Build backend for production |
| `npm run frontend:build` | Build Angular for production |

### Environment

- **Backend**: Uses `PORT` (default 3000), `FRONTEND_URL` (default http://localhost:4200) for CORS
- **Frontend**: `src/environments/environment.ts` — `apiUrl` for development; replaced in production

---

## Project Context

AccessER does **not** diagnose, prioritize treatment, or provide medical advice. It operates as an accessibility and system-equity support layer alongside existing clinical workflows.

| Layer | Purpose |
|-------|---------|
| **Patient** | Accessibility intake, burden curves, 20-min check-ins |
| **Staff** | Queue Equity View, risk indicators, suggested actions |
| **Admin** | Intervention sliders, equity gap simulation |

---

## License

UNLICENSED (private project)
