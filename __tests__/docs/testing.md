# Testing Guide

## Overview

The project uses **Jest** with **next/jest** for testing API routes and library code. All tests run in a Node.js environment (no browser/DOM) since we're testing server-side code.

Tests use mocks for all external dependencies (Prisma, Auth.js, bcrypt) so they run fast without needing a database connection or any environment variables.

---

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

Re-runs tests automatically when files change. Useful during development.

```bash
npm run test:watch
```

### Run tests with coverage report

Generates a coverage report showing which lines of source code are covered by tests.

```bash
npm run test:coverage
```

### Run a specific test file

```bash
npx jest __tests__/api/visits/visit-update.test.ts
```

### Run tests matching a pattern

```bash
npx jest --testPathPattern="auth"
```

This would run `auth.test.ts`, `me.test.ts`, and `change-password.test.ts` (anything with "auth" in the path).

### Run a specific test by name

```bash
npx jest -t "returns 401 when user is null"
```

---

## Test Structure

```
__tests__/
├── helpers/
│   ├── fixtures.ts              # Shared mock data (users, visits)
│   └── request.ts               # Helper to build NextRequest objects
├── unit/
│   ├── auth.test.ts             # Auth config (authorize function, callbacks)
│   └── get-user-from-session.test.ts  # Session helper utility
├── api/
│   ├── auth/
│   │   ├── me.test.ts                  # GET /api/auth/me
│   │   └── change-password.test.ts     # PATCH /api/auth/change-password
│   └── visits/
│       ├── visits-list.test.ts         # GET /api/visits
│       └── visit-update.test.ts        # PATCH /api/visits/[id]
└── docs/
    └── testing.md               # This file
```

- **`helpers/`** — Shared utilities and mock data used across test files
- **`unit/`** — Tests for library code and utilities (not HTTP endpoints)
- **`api/`** — Tests for API route handlers (mirrors the `src/app/api/` structure)

---

## How Mocking Works

Tests don't hit a real database or auth provider. Instead, we mock three things:

### 1. Prisma (`@/src/lib/prisma`)

```typescript
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    visit: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), count: jest.fn() },
  },
}))
```

Then in tests, control what the mock returns:

```typescript
(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser)
```

### 2. Auth.js (`@/auth` or `@/src/lib/get-user-from-session`)

For route handlers that use `getUserFromSession`:

```typescript
jest.mock('@/src/lib/get-user-from-session', () => ({
  getUserFromSession: jest.fn(),
}))

// Simulate authenticated user
(getUserFromSession as jest.Mock).mockResolvedValue({ user: mockAdminUser })

// Simulate unauthenticated request
(getUserFromSession as jest.Mock).mockResolvedValue({
  user: null,
  error: { message: 'Unauthorized', status: 401 },
})
```

For routes that use `auth()` directly (like `/api/auth/me`):

```typescript
jest.mock('@/auth', () => ({ auth: jest.fn() }))

(auth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } })
```

### 3. bcrypt (`bcryptjs`)

```typescript
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

(bcrypt.compare as jest.Mock).mockResolvedValue(true)   // password matches
(bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$newhash')
```

---

## Writing a New Test

### For a new API route

1. Create a test file in `__tests__/api/` mirroring the route path
2. Import the route handler function (`GET`, `POST`, `PATCH`, etc.)
3. Mock `getUserFromSession` and `prisma`
4. Call the handler with a `Request` or `NextRequest` object
5. Assert on `response.status` and `await response.json()`

Example:

```typescript
import { GET } from '@/src/app/api/some-route/route'
import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'
import { mockAdminUser } from '../../helpers/fixtures'

jest.mock('@/src/lib/get-user-from-session', () => ({
  getUserFromSession: jest.fn(),
}))
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: { /* mock the models you need */ },
}))

describe('GET /api/some-route', () => {
  it('returns data for authenticated user', async () => {
    (getUserFromSession as jest.Mock).mockResolvedValue({ user: mockAdminUser })

    const req = new Request('http://localhost:3000/api/some-route')
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(/* expected data */)
  })
})
```

### For routes with dynamic params (Next.js 15)

In Next.js 15, `params` is a `Promise`. Pass it like this:

```typescript
import { PATCH } from '@/src/app/api/items/[id]/route'
import { createRequest } from '../../helpers/request'

const req = createRequest('/api/items/some-id', {
  method: 'PATCH',
  body: { name: 'updated' },
})

const response = await PATCH(req, {
  params: Promise.resolve({ id: 'some-id' }),
})
```

### Adding mock fixtures

Add reusable mock objects to `__tests__/helpers/fixtures.ts`. Keep them minimal — only include fields that the source code actually uses.

---

## Configuration

The Jest config lives in `jest.config.ts` at the project root:

- **`testEnvironment: 'node'`** — all tests run in Node.js (no jsdom)
- **`next/jest`** — handles TypeScript compilation via SWC and path alias resolution
- **`moduleNameMapper`** — maps `@/*` to the project root (same as `tsconfig.json` paths)
- **`clearMocks: true`** — all mocks are automatically reset between tests
