# UI Implementation

## What

A fully responsive web application UI for managing sales visits (posete). The interface consists of:

- **Login page** — Email/password authentication form
- **Dashboard** — Sidebar-based layout with two views:
  - **Upcoming visits** (`/dashboard/upcoming`) — Visits with status `PENDING`, filtered by date (defaults to today, with a date picker to select future dates)
  - **Previous visits** (`/dashboard/previous`) — Visits with status `DONE`, paginated
- **Responsive sidebar** — Fixed sidebar on desktop, hamburger menu with slide-out sheet on mobile
- **Logout** — Pinned at the bottom of the sidebar

## Why

### Technology Choices

**Tailwind CSS v4** — CSS-first configuration using `@import "tailwindcss"` with PostCSS. No `tailwind.config.js` needed. Theme tokens are defined as CSS custom properties (oklch color space) in `src/app/globals.css`. This is the latest approach recommended by Tailwind.

**shadcn/ui** — Pre-built, accessible, customizable components (Button, Card, Input, Label, Badge, Sheet, Separator). Components are copied into the project (`components/ui/`) rather than installed as a dependency, giving full control over styling and behavior. Uses Radix UI primitives under the hood.

**TanStack React Query** — Client-side data fetching with built-in caching, loading states, and error handling. Used for fetching visits from the API with automatic cache management per query key (status + date + page).

**react-hook-form + Zod** — Form management with schema-based validation. Zod schemas provide type-safe validation with custom Serbian error messages. react-hook-form minimizes re-renders and integrates cleanly with shadcn Input components.

**react-hot-toast** — Lightweight toast notifications for login errors and other feedback.

**lucide-react** — Consistent icon library used throughout the UI (CalendarClock, History, LogOut, Briefcase, MessageSquare, Calendar, Clock, Star, FileText, StickyNote, etc.).

### Architectural Decisions

**Route groups** — Next.js App Router route groups separate public and authenticated routes:
- `(public)/` — Login page with centered layout, no sidebar
- `(auth)/` — Dashboard pages wrapped with sidebar layout

This keeps layouts clean and co-located with their respective routes.

**Cookie-based middleware authentication** — `src/middleware.ts` checks for the Auth.js session cookie (`authjs.session-token` or `__Secure-authjs.session-token`) to determine authentication state. This runs at the edge before page rendering:
- `/` redirects to `/dashboard/upcoming` (logged in) or `/login` (not logged in)
- `/login` redirects to `/dashboard/upcoming` if already logged in
- All other routes redirect to `/login` if not logged in
- API routes, static assets, and images are excluded via the matcher pattern

**Middleware location** — The middleware file is at `src/middleware.ts` (not project root) because Next.js requires middleware to be at the same level as the `app/` directory when using the `src/` directory structure.

**Client-side data fetching over Server Components** — Dashboard pages use `'use client'` with React Query instead of server-side data fetching. This enables interactive features (date picker, pagination) with instant state transitions and cached data.

## How

### Project Structure

```
components/
├── ui/                    # shadcn components (auto-generated + customized)
│   ├── button.tsx         # Extended with isLoading prop
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── badge.tsx
│   ├── sheet.tsx
│   └── separator.tsx
├── sidebar.tsx            # Responsive sidebar (desktop + mobile)
└── visit-card.tsx         # Visit display card (upcoming/previous variants)

hooks/
└── use-mobile.ts          # useIsMobile() hook (768px breakpoint)

lib/
└── utils.ts               # cn() utility (clsx + tailwind-merge)

src/
├── app/
│   ├── globals.css        # Tailwind v4 imports + CSS variable theme
│   ├── layout.tsx         # Root layout (Inter font, Providers)
│   ├── providers.tsx      # SessionProvider + QueryClientProvider + Toaster
│   ├── page.tsx           # Root redirect to /login
│   ├── (public)/
│   │   ├── layout.tsx     # Centered layout for login
│   │   └── login/
│   │       └── page.tsx   # Login form
│   └── (auth)/
│       ├── layout.tsx     # Sidebar + content layout
│       └── dashboard/
│           ├── page.tsx           # Redirect to /dashboard/upcoming
│           ├── actions.ts         # fetchVisits() API helper
│           ├── upcoming/
│           │   └── page.tsx       # Date picker + PENDING visits
│           └── previous/
│               └── page.tsx       # Paginated DONE visits
├── middleware.ts           # Auth middleware (cookie-based)
├── schemas/
│   └── login-schema.ts    # Zod validation schema
└── types/
    └── visit.ts           # Visit, VisitUser, VisitsResponse interfaces
```

### Responsive Design

| Breakpoint | Sidebar | Content | Navigation |
|---|---|---|---|
| Mobile (<768px) | Hidden; fixed top bar (h-14) with hamburger button | Full width, below top bar (`pt-14`) | Sheet overlay from left |
| Desktop (md+) | Fixed left sidebar (w-64), full height | Left margin 256px (`md:ml-64`) | Always visible in sidebar |

Visit cards use a responsive grid: 1 column on mobile, 2 columns on `md`, 3 columns on `xl`.

The `useIsMobile()` hook uses `window.matchMedia` to detect the breakpoint and drives the sidebar rendering logic — desktop renders a fixed `<aside>`, mobile renders a `<Sheet>` triggered by a hamburger button.

### Authentication Flow

1. User visits any URL
2. Middleware checks for session cookie
3. If not authenticated → redirect to `/login`
4. User submits email + password on login form
5. `signIn('credentials')` calls the Auth.js authorize function
6. Auth.js verifies credentials against the database (bcrypt comparison)
7. On success, JWT session is created, cookie is set
8. Client redirects to `/dashboard/upcoming`
9. Subsequent requests pass middleware check via cookie

### Data Fetching

The `fetchVisits()` function in `actions.ts` calls the internal API (`/api/visits`) with query parameters:
- `status` — `PENDING` or `DONE`
- `plannedVisitDate` — ISO date string (upcoming visits only)
- `page` — Page number (previous visits only)

React Query manages caching with composite keys like `['visits', 'PENDING', '2025-01-15']` so that changing the date or page triggers a new fetch while preserving cached data for previously viewed combinations.

### Visit Card Variants

The `VisitCard` component accepts a `variant` prop (`'upcoming'` or `'previous'`) that controls which fields are displayed:

**Both variants show:**
- Business partner (card header)
- Status badge
- Planned topic
- Planned visit date
- Planned visit time + duration

**Previous variant additionally shows:**
- Realised topic
- Note
- Grade
