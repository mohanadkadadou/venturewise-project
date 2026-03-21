# VentureWise Platform

## Overview

VentureWise is a professional business intelligence and investment platform that helps entrepreneurs validate and plan their business ventures. It features AI-powered feasibility analysis, a job marketplace, investment opportunities, and an admin control panel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **State management**: React Query (@tanstack/react-query)
- **Forms**: react-hook-form + zod validation
- **Charts**: recharts
- **Animations**: framer-motion
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (API server)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/       # Express 5 API server
│   └── venturewise/      # React + Vite frontend
├── lib/
│   ├── api-spec/         # OpenAPI spec + Orval codegen config
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/          # Generated Zod schemas from OpenAPI
│   └── db/               # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── categories.ts
│           ├── users.ts
│           ├── projects.ts
│           ├── analyses.ts
│           ├── jobs.ts
│           ├── applications.ts
│           └── startup-ideas.ts
├── scripts/
│   └── src/seed.ts       # Database seeder
```

## UI/UX Features

- **Dark / Light mode** — next-themes ThemeProvider, toggled via Navbar Sun/Moon button; persists in `localStorage` as `vw-theme`
- **Multi-language (i18n)** — i18next with English / Arabic / Turkish; Arabic auto-applies RTL via `document.documentElement.dir`; persists as `vw-language`
- **Step-by-step loading animation** — Home form overlay shows 6 animated steps + progress bar during 4–6 s backend analysis delay
- **Real charts** — recharts: RadarChart (6 dimensions), AreaChart (12-month projection), PieChart (market breakdown)

## Key Features

1. **Business Feasibility Analysis Engine** — Rule-based analysis (not random) producing:
   - Success score (0-100)
   - Risk level (Low/Medium/High)
   - Market demand and competition levels
   - Estimated monthly revenue range
   - Full explanation, market analysis, pricing strategy, marketing plan, branding, products, hiring

2. **Job Marketplace** — 8 seeded job listings, apply with name/skills/experience/CV

3. **Startup Ideas Marketplace** — Admin-managed investment opportunities with ROI, risk, and stage

4. **Admin Dashboard** — Platform stats, user management, add jobs/startup ideas, delete projects

5. **Project History** — All past projects with analysis scores

## Database Tables

- `categories` — Business categories (12 seeded)
- `users` — Users with role (user/admin)
- `projects` — Business project submissions
- `analyses` — Feasibility analysis results (1:1 with projects)
- `jobs` — Job opportunities
- `applications` — Job applications (M:1 with jobs)
- `startup_ideas` — Investment opportunities

## API Endpoints

- `GET /api/healthz` — Health check
- `GET/POST /api/projects` — List and create projects
- `GET/DELETE /api/projects/:id` — Get/delete project with analysis
- `GET /api/categories` — Business categories
- `GET/POST /api/jobs` — List/create jobs
- `GET /api/jobs/:id` — Job details
- `POST /api/jobs/:jobId/apply` — Apply for job
- `GET /api/jobs/:jobId/applications` — Job applicants (admin)
- `GET/POST /api/startup-ideas` — Investment marketplace
- `GET /api/admin/users` — User list (admin)
- `GET /api/admin/stats` — Platform statistics

## Frontend Pages

1. **Home** (`/`) — Business analysis form
2. **Dashboard** (`/dashboard/:id`) — Analysis results with charts
3. **Projects** (`/projects`) — History of all analyses
4. **Jobs** (`/jobs`) — Job opportunities with filters
5. **Apply** (`/apply`) — Job application form
6. **Startup Ideas** (`/ideas`) — Investment marketplace
7. **Admin** (`/admin`) — Admin control panel

## Running

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/venturewise run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Seed sample data
pnpm --filter @workspace/scripts run seed

# Run codegen (after OpenAPI spec changes)
pnpm --filter @workspace/api-spec run codegen
```
