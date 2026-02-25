# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`frontend/`)
```bash
cd frontend
npm run dev       # Vite dev server (port 5173) — /api trafiğini localhost:3001'e proxy'ler
npm run build     # TypeScript check + production build (dist/)
npm run preview   # Preview production build locally
```

### Backend (`backend/`)
```bash
cd backend
npm run dev       # tsx watch ile backend başlat (port 3001)
npm run build     # tsc ile dist/ klasörüne derle
npm run db:migrate  # Prisma migration'larını uygula
npm run db:generate # Prisma client'ı yeniden üret (schema değişince)
```

### Docker (tüm stack)
```bash
cp .env.example .env          # .env dosyasını oluştur ve şifreleri ayarla
docker compose up --build     # 3 servis: postgres + backend + frontend (port 80)
```

There is no test framework configured in this project.

## Architecture

Turkish-language SPA for university students to track course attendance. Multi-container Docker setup with a shared PostgreSQL backend — all clients see the same data.

```
Browser → Nginx (port 80)
               ├── /       → React SPA (static files)
               └── /api/*  → backend:3001 (Express)
                                  └── PostgreSQL (port 5432, internal)
```

**Dev:** Vite proxy (`/api` → `localhost:3001`) eliminates CORS issues. Run `cd frontend && npm run dev` for frontend, `cd backend && npm run dev` for backend.

### Auth

Static password gate — no user accounts. `APP_PASSWORD` and `TOKEN_SECRET` env vars live in `.env` (Docker Compose picks them up). Login flow:
1. `POST /api/auth/login` validates password, returns `HMAC-SHA256(APP_PASSWORD, TOKEN_SECRET)` as token
2. Token stored in `sessionStorage`, sent as `Authorization: Bearer <token>` on every request
3. `frontend/src/lib/auth.ts` — token helpers; `frontend/src/lib/api.ts` — fetch wrapper that injects the header and redirects to `/login` on 401
4. `<ProtectedRoute>` in `App.tsx` guards all routes

### Data Layer

**Backend:** `backend/prisma/schema.prisma` defines 3 models with cascade deletes:
- **Course** → **ScheduleSlot** → **AttendanceRecord**

Deleting a course cascades through all child records automatically.

**Frontend:** `frontend/src/db/db.ts` holds only TypeScript interfaces (no Dexie). Data fetching is done via **TanStack Query v5** — singleton `queryClient` in `frontend/src/lib/queryClient.ts`.

### Hooks (`frontend/src/hooks/`)

Each hook wraps a `useQuery` call and returns plain arrays (empty `[]` while loading). Mutation functions (`addCourse`, `setAttendance`, etc.) call `apiFetch` then `queryClient.invalidateQueries(...)` to keep the cache fresh. Pages never call the API or queryClient directly.

Query keys:
- `['courses']`
- `['schedule-slots']`
- `['attendance']` — all records (Rapor)
- `['attendance', week, year]` — weekly (Yoklama)

### API Endpoints (`backend/src/routes/`)

All routes except `POST /api/auth/login` require `Authorization: Bearer <token>`.

```
POST   /api/auth/login
GET/POST/PUT/DELETE  /api/courses
GET/POST/DELETE      /api/schedule-slots
GET/PUT/DELETE       /api/attendance   (GET accepts ?week=&year= filter)
```

### Pages (`frontend/src/pages/`)

- **Dersler** — course CRUD with color picker and required attendance %
- **Program** — weekly schedule builder (day/time/location per course)
- **Yoklama** — attendance marking per course per ISO week
- **Rapor** — attendance statistics with pass/fail/risk status and worst-case projections
- **Login** — static password gate

### Business Logic (`frontend/src/lib/`)

- `attendance.ts` — calculates current attendance %, worst-case scenario, risk detection (within 5% of threshold)
- `dates.ts` — ISO week utilities and Turkish-locale date formatting via `date-fns`

### UI

- Responsive layout: bottom nav on mobile, sidebar on desktop (`frontend/src/components/layout/Layout.tsx`)
- Tailwind CSS with custom component classes (`.card`, `.btn-*`, `.input`, `.label`) in `frontend/src/index.css`
- Icons from `lucide-react`
