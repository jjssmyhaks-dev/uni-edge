# Uni-Edge

**Automated administrative, admissions, and examination platform for Indian universities and colleges.**

Uni-Edge digitizes the full student lifecycle — from entrance exam through admission, ongoing admin, and regular/online proctored examinations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| **State/Data** | TanStack Query, React Hook Form, Zod validation |
| **Backend API** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL (via Supabase) with Row-Level Security |
| **Auth** | Clerk v7 with native Supabase integration |
| **AI Service** | Python 3.12, FastAPI, LlamaParse, LangChain/LangGraph |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Observability** | New Relic (APM + Browser Monitoring) |
| **Hosting** | Vercel (frontend), Containerized (API + AI service) |

---

## Project Structure

```
uni-edge/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router route groups
│   │   │   │   ├── (public)/   # Landing, login, signup
│   │   │   │   ├── (admin)/    # Admin dashboard (all modules)
│   │   │   │   ├── (student)/  # Student portal
│   │   │   │   ├── (applicant)/ # Applicant portal
│   │   │   │   └── (super-admin)/ # Platform management
│   │   │   ├── components/     # Shared UI components
│   │   │   └── lib/            # Utilities, API client, Supabase
│   │   └── newrelic.js         # New Relic agent config
│   ├── api/                    # Express API server
│   │   └── src/
│   │       ├── routes/         # All API route groups
│   │       ├── middleware/      # Auth, RBAC, error handling
│   │       └── lib/            # Supabase client, audit logging
│   └── ai-service/             # Python FastAPI service
│       ├── app/main.py         # API endpoints
│       └── requirements.txt
├── packages/
│   └── shared/                 # Shared types, validators, constants
│       └── src/
│           ├── types/          # TypeScript interfaces
│           ├── validators/     # Zod schemas
│           └── constants/      # Enums, role definitions
├── supabase/
│   ├── migrations/             # Database schema (14 migrations)
│   ├── seed.sql                # Development seed data
│   └── config.toml             # Local Supabase config
└── turbo.json                  # Turborepo pipeline config
```

---

## Prerequisites

- **Node.js** 22+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker Desktop** (required for Supabase local dev)
- **Supabase CLI** (`npm install -g supabase`)
- **Python 3.12+** (for AI service)
- Accounts: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [New Relic](https://newrelic.com)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> uni-edge
cd uni-edge
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
```

Edit the `.env` files with your actual keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `NEW_RELIC_LICENSE_KEY` | New Relic → Account Settings → API Keys |

### 3. Start Local Supabase

```bash
supabase start
```

This starts a local Postgres + PostgREST + GoTrue stack. Copy the `anon key` and `service role key` from the output into your `.env` files.

### 4. Run Database Migrations & Seed

```bash
supabase db reset    # Runs all migrations + seed data
```

### 5. Start Development Servers

```bash
pnpm dev
```

This starts all services concurrently:
- **Frontend**: http://localhost:3000
- **Express API**: http://localhost:4001
- **Health Check**: http://localhost:4001/health

### 6. Start Python AI Service (optional)

```bash
cd apps/ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- **AI Service**: http://localhost:8000
- **AI Docs**: http://localhost:8000/docs

---

## Module Overview

### Module 1: Pre-Admission & Entrance Examination
- Program/seat/eligibility configuration
- Entrance exam setup (online/offline/hybrid)
- Candidate registration & admit cards
- Score entry (manual + bulk CSV)
- Merit list generation with category-wise ranking

### Module 2: Admission Decision & Enrollment
- Public multi-step application form
- Document upload with AI parsing (LlamaParse)
- Application review dashboard
- Offer letters & seat confirmation
- Auto student account creation on enrollment

### Module 3: Admin Roles & Permissions
- RBAC with 8 role types
- Clerk JWT custom claims (`institution_id`, `role`, `department_id`)
- Supabase RLS for multi-tenant data isolation
- Full audit logging

### Module 4: Academic/Office Admin
- Daily/period-wise attendance marking
- Attendance reports with low-attendance alerts
- Student records management
- Notice publishing (in-app, email, SMS)
- Document request workflow (transcripts, certificates)

### Module 5: Examination Process (Regular)
- Exam scheduling by term/semester
- Room/hall allocation with capacity management
- Invigilator assignment (double-booking prevention)
- Hall ticket generation & issuance
- Result entry, grade/marksheet generation

### Module 6: Online Proctored Examination
- Online exam delivery with browser lockdown
- Webcam monitoring & identity verification
- Anti-cheating detection (10 flag types):
  - Tab switching, multiple faces, no face
  - Unusual audio, copy/paste, right-click
  - Fullscreen exit, suspicious movement, ID mismatch
- Human review queue for flagged sessions
- Post-exam proctoring reports

---

## API Reference

All API routes are prefixed with `/api/v1`:

| Route | Module | Description |
|---|---|---|
| `GET/POST /institutions` | Core | Institution CRUD |
| `GET/POST /departments` | Core | Department CRUD |
| `GET/POST /programs` | Core | Program CRUD |
| `GET/POST /users` | Core | User management |
| `GET/POST /admission-cycles` | 1 | Admission cycle CRUD |
| `GET/POST /entrance-exams` | 1 | Entrance exam CRUD + lock/publish |
| `GET/POST /exam-candidates` | 1 | Candidate registration |
| `GET/POST /exam-results` | 1 | Score entry + merit list |
| `GET/POST /applications` | 2 | Application submission + review |
| `GET/POST /documents` | 2 | Document upload + verification |
| `GET/POST /attendance` | 4 | Attendance tracking + bulk |
| `GET/POST /notices` | 4 | Notice publishing |
| `GET/POST /document-requests` | 4 | Document request workflow |
| `GET/POST /regular-exams` | 5 | Regular exam CRUD + rooms + results |
| `GET/POST /proctoring` | 6 | Proctoring sessions + flags |

---

## Architecture Decisions

### Multi-Tenancy
Every core table has an `institution_id`. Supabase RLS policies enforce data isolation — users can only see their own institution's data. The `super_admin` role bypasses institution checks for support/ops.

### Auth Flow
1. User signs in via Clerk
2. Clerk attaches custom JWT claims: `institution_id`, `role`, `department_id`
3. Express API verifies JWT via `@clerk/backend`
4. Supabase RLS reads the same JWT claims for DB-level enforcement
5. Defense in depth: both API middleware and DB policies enforce access

### Observability
New Relic provides:
- **APM**: Distributed tracing across Next.js → Express → Supabase
- **Browser Monitoring**: Frontend performance (page load, interaction timing)
- **Infrastructure Monitoring**: CPU, memory, DB connections
- **Error Tracking**: Automatic error grouping and alerting

---

## Development Workflow

```bash
# Typecheck all packages
pnpm typecheck

# Typecheck individual packages
cd apps/web && pnpm typecheck
cd apps/api && pnpm typecheck

# Run Supabase migrations
supabase db reset

# Generate Supabase types (after schema changes)
supabase gen types typescript --local > packages/shared/src/types/database.ts
```

---

## Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Express API + Python AI Service
Deploy as containerized services on Oracle Cloud or Google Cloud:

```bash
# Build API
cd apps/api && pnpm build

# Build AI service
cd apps/ai-service && docker build -t uni-edge-ai .
```

---

## License

Private — Uni-Edge
