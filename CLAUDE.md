# Timr Frontend — Next.js 16 App Router

Multi-tenant SaaS frontend for shift scheduling and employee management. Built with React 19, TypeScript, and shadcn components.

## Quick Reference

```bash
npm run dev             # Start dev server with Turbopack
npm run build           # Production build
npm run typecheck       # TypeScript check (tsc --noEmit)
npm run check:fix       # Biome lint + format with auto-fix
npm run format          # Biome format only
```

- **Dev server**: http://localhost:3000
- **API proxy**: Next.js API routes (`src/app/api/`) proxy to backend at http://localhost:8000
- **Linting/Formatting**: Biome (not ESLint/Prettier)
- **Styling**: Tailwind CSS 4 with `@theme` directive for custom colors
- **i18n**: next-intl — Icelandic (default) + English

## Architecture

- **App Router**: `src/app/` — route groups: `(auth)` for login/register, `dashboard/` for protected pages
- **Components**: `src/components/` — built on shadcn (Base UI primitives) + Tailwind
- **Context**: `src/context/UserContext.tsx` — global auth state via `useUser()` hook
- **Types**: `src/types/forms.ts` — Zod schemas and TypeScript interfaces
- **Utils**: `src/utils/` — `api.ts` (Axios instance), `auth.ts` (token management), `classname.ts` (cn utility), `server-auth.ts` (cookie auth)
- **Lib**: `src/lib/utils.ts` — `cn()`, `formatSsn()`, `formatPhone()`, `formatDuration()` (dayjs with Icelandic locale)
- **i18n**: `src/i18n/` — `config.ts` (locales), `request.ts` (server config). Translations in `messages/is.json` and `messages/en.json`
- **Path alias**: `@/*` maps to `./src/*`

### Key Pages

| Route | Purpose |
|-------|---------|
| `/login`, `/register` | Auth forms (react-hook-form + Zod) |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/auth/callback` | OAuth callback handler |
| `/dashboard` | Home with onboarding wizard (Company → Shifts → Staff → Done) |
| `/dashboard/shifts` | Weekly calendar with drag-and-drop (dnd-kit) |
| `/dashboard/employees` | Employee CRUD with drawer forms |
| `/dashboard/punch-clock` | Employee clock in/out |
| `/dashboard/time-entry` | Manager time entry view + per-employee view |
| `/dashboard/settings/*` | Company settings, shifts config, shift templates |

### API Proxy Pattern

The frontend proxies all API calls through Next.js API routes instead of calling Laravel directly:

```
Browser → /api/forms/login (Next.js route) → POST /api/auth/login (Laravel)
Browser → /api/manager/employees (Next.js route) → GET /api/manager/employees (Laravel)
```

Proxy routes live in `src/app/api/` organized by domain:
- `api/forms/` — login, register, forgot-password, reset-password
- `api/auth/` — user, logout, onboarding, company, social-accounts
- `api/manager/` — employees, shifts, shift-assignments, shift-templates, clock-entries (+ export, summary), locations
- `api/employee/` — clock-in, clock-out, shifts, clock-entries, calendar-subscribe

Each proxy route: extracts auth token → forwards to Laravel → handles errors → returns JSON.

### Auth Flow

1. Login/register → POST to Next.js API route → validates with Zod → proxies to Laravel
2. Token stored in localStorage (client) and httpOnly cookie (server)
3. `UserProvider` wraps dashboard layout, fetches user profile via `/api/auth/user`, redirects if unauthenticated
4. `useUser()` hook provides: `{ user, setUser, isManager, isEmployee, logout }`
5. Manager = company role owner or admin; Employee = has employee record

### Component Structure

- **Navigation**: `app-sidebar.tsx`, `nav-main.tsx`, `nav-secondary.tsx`, `nav-user.tsx`, `team-switcher.tsx`
- **Onboarding**: `components/onboarding/` — CompanyStep, ShiftsStep, StaffStep, SalaryStep, DoneStep
- **Shifts**: `components/shifts/` — WeeklyCalendar, EmployeeWeeklyCalendar
- **Time Entry**: `components/time-entry/` — ManagerTimeEntry, EmployeeTimeEntry
- **UI (shadcn)**: ~25 components — Button, Input, Dialog, Sheet, AlertDialog, DataTable, DatePicker, etc.
- **Custom**: Modal, Dialog, LinkedAccounts, SocialLoginButtons, ProgressBar

## Conventions

- **Forms**: Zod schema → react-hook-form with `zodResolver` → shadcn `Input` (spread `{...register("field")}` directly)
- **Styling**: Tailwind utilities only, use `cn()` for conditional classes
- **UI patterns**: shadcn Sheet for side panels, shadcn AlertDialog for confirmations
- **Duration format**: Always use `formatDuration()` from `@/lib/utils` — outputs `Xklst Ymin`. Never format durations inline.
- **Biome config**: 2-space indent, 120 line width, LF line endings, organize imports on save
- **Do not add redundant Tailwind classes** that duplicate shadcn/CSS-variable defaults

### Internationalization (next-intl)

All user-facing strings must go through `next-intl`. Never hardcode UI text.

- **Locales**: Icelandic (`is`, default) and English (`en`)
- **Translation files**: `messages/is.json` and `messages/en.json` — flat namespaced JSON (e.g. `nav.shifts`, `employees.title`)
- **Config**: `src/i18n/config.ts` defines locales, `src/i18n/request.ts` provides server config. `next.config.ts` uses `createNextIntlPlugin`.
- **Locale switching**: Cookie-based (`NEXT_LOCALE`), switched via `POST /api/locale` → language selector in sidebar (`nav-secondary.tsx`)
- **Root layout**: `src/app/layout.tsx` wraps the app with `NextIntlClientProvider` and sets `<html lang={locale}>`

**Usage in client components:**
```tsx
"use client";
import { useTranslations } from "next-intl";

const t = useTranslations();         // all namespaces
const t = useTranslations("nav");    // scoped to nav.*
t("shifts")                          // → "Vaktir" (is) / "Shifts" (en)
```

**When adding new strings:**
1. Add the key to both `messages/is.json` and `messages/en.json`
2. Use a descriptive namespace: `"feature.keyName"` (e.g. `"employees.addEmployee"`)
3. Use `t("namespace.key")` in components — never inline Icelandic or English text

### Color System (shadcn CSS variables)

| Token | Light mode value | Usage |
|-------|-----------------|-------|
| `primary` | `rgb(10, 124, 104)` (teal) | Primary actions, links |
| `primary-foreground` | near-white | Text on primary bg |
| `secondary` | `rgb(200, 232, 227)` (light teal) | Secondary actions |
| `secondary-foreground` | dark | Text on secondary bg |
| `background` | white | Page background |
| `foreground` | near-black | Default body text |
| `muted` | light gray | Subtle backgrounds |
| `muted-foreground` | medium gray | Placeholder, hints |
| `card` / `popover` | white | Surface backgrounds |
| `border` | light gray | Input/divider borders |
| `ring` | gray | Focus rings |
| `destructive` | red | Error/delete actions |

Use Tailwind semantic classes (`text-foreground`, `bg-primary`, `border-border`) instead of raw color utilities.

### Key Libraries

- `shadcn` — UI component library (Base UI primitives)
- `lucide-react` — icons
- `@dnd-kit/core` — drag and drop for shift calendar
- `dayjs` — date manipulation (Icelandic locale)
- `sonner` — toast notifications
- `axios` — HTTP client with error interceptor
- `@tanstack/react-table` — data tables
- `zod` — schema validation
- `react-hook-form` — form state management
- `next-intl` — internationalization (Icelandic + English)

## Development Workflow

1. Backend tests and implementation first (in `../timr-api/`)
2. Then implement frontend changes here
3. Run `npm run check:fix` after changes

---

## API (Laravel 12) — Cross-Reference

The backend lives in `../timr-api/` and is a Laravel 12 REST API. Understanding its structure is essential for frontend work.

### API Base URL

Development: `http://localhost:8000` (configured via `NEXT_PUBLIC_API_URL`)

### Authentication

- **Mechanism**: Laravel Sanctum token-based auth
- **Login**: `POST /api/auth/login` → returns `{ "token": "...", "user": {...} }`
- **Register**: `POST /api/auth/register` → returns `{ "token": "...", "user": {...} }`
- **All protected requests**: Include `Authorization: Bearer <token>` header
- **OAuth**: Redirect to `/api/auth/redirect/{provider}`, callback at `/api/auth/callback/{provider}`

### API Route Groups

| Group | Prefix | Auth Required | Purpose |
|-------|--------|--------------|---------|
| Public | `/api` | No | Auth endpoints, public calendar |
| Authenticated | `/api/auth` | Yes | User profile, company creation, onboarding |
| Manager | `/api/manager` | Yes + Owner/Admin role | CRUD for employees, shifts, assignments, clock entries, locations, shift templates |
| Employee | `/api/employee` | Yes + Employee record | View shifts, clock in/out, calendar subscribe |

### Key Endpoints

**Auth:**
- `POST /api/auth/login` — `{ email, password, remember? }`
- `POST /api/auth/register` — `{ name, email, password, password_confirmation }`
- `POST /api/auth/logout` — invalidate token
- `GET /api/auth/user` — current user with company
- `POST /api/auth/company` — create company during onboarding
- `PATCH /api/auth/onboarding` — update onboarding step

**Manager — Employees:**
- `GET /api/manager/employees` — list employees
- `POST /api/manager/employees` — create employee `{ name, ssn, email?, phone? }`
- `PUT /api/manager/employees/{id}` — update employee
- `DELETE /api/manager/employees/{id}` — delete employee
- `POST /api/manager/employees/{id}/invite` — send invite

**Manager — Shifts:**
- `GET /api/manager/shifts` — list shifts (query: `start_date`, `end_date`)
- `POST /api/manager/shifts` — create shift `{ title, start_time, end_time, notes? }`
- `PUT /api/manager/shifts/{id}` — update shift
- `DELETE /api/manager/shifts/{id}` — delete shift (with deletion preview)
- `POST /api/manager/shifts/publish` — bulk publish by date range
- `POST /api/manager/shifts/unpublish` — bulk unpublish

**Manager — Shift Assignments:**
- `POST /api/manager/shift-assignments` — assign employee to shift on date
- `DELETE /api/manager/shift-assignments/{id}` — remove assignment

**Manager — Clock Entries:**
- `GET /api/manager/clock-entries` — list clock entries (filterable)
- `GET /api/manager/clock-entries/summary` — summary/aggregate data
- `GET /api/manager/clock-entries/export` — CSV export

**Manager — Shift Templates:**
- CRUD + `POST /api/manager/shift-templates/{id}/generate` — generate schedule from template

**Manager — Locations:**
- `GET /api/manager/locations` — list locations
- `POST /api/manager/locations` — create location with geofence radius

**Employee:**
- `GET /api/employee/shifts` — list assigned shifts
- `POST /api/employee/clock-in` — clock in `{ shift_id, latitude, longitude }`
- `POST /api/employee/clock-out` — clock out `{ latitude, longitude }`
- `GET /api/employee/clock-entries` — list own clock entries
- `POST /api/employee/calendar-subscribe` — get iCal subscription URL

### Response Format

All responses use Laravel API Resources:
```json
{
  "data": { ... }          // Single resource
  "data": [{ ... }, ...]   // Collection
}
```

Validation errors (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Key Domain Concepts for Frontend

- **Multi-company**: A user can belong to multiple companies. The active company determines what data they see.
- **Roles**: Owner and Admin are "managers" who can manage shifts/employees. Employee role can only view and clock.
- **Company scoping**: All data is automatically scoped to the user's current company on the backend.
- **Shift publishing**: Shifts are created as drafts. Managers publish them by date range so employees can see them.
- **Geofencing**: Clock-in validates the employee's GPS location against the shift's location geofence radius.
- **Shift templates**: Predefined rotation patterns (2-2-3, 5-5-4, 5-2, 4-3, custom) that generate shift assignments.
