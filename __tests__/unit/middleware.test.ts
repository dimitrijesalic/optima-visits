import { NextRequest } from 'next/server'
import { middleware } from '@/src/middleware'

function createMiddlewareRequest(
  pathname: string,
  cookies?: Record<string, string>
): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000')
  const req = new NextRequest(url)

  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value)
    }
  }

  return req
}

describe('middleware', () => {
  describe('root path /', () => {
    it('redirects unauthenticated user to /login', async () => {
      const req = createMiddlewareRequest('/')
      const response = await middleware(req)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    })

    it('redirects authenticated user to /dashboard/upcoming', async () => {
      const req = createMiddlewareRequest('/', {
        'authjs.session-token': 'valid-token',
      })
      const response = await middleware(req)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe(
        '/dashboard/upcoming'
      )
    })

    it('recognizes __Secure- prefixed cookie', async () => {
      const req = createMiddlewareRequest('/', {
        '__Secure-authjs.session-token': 'valid-token',
      })
      const response = await middleware(req)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe(
        '/dashboard/upcoming'
      )
    })
  })

  describe('/login page', () => {
    it('allows unauthenticated user to access /login', async () => {
      const req = createMiddlewareRequest('/login')
      const response = await middleware(req)

      expect(response.status).toBe(200)
    })

    it('redirects authenticated user away from /login', async () => {
      const req = createMiddlewareRequest('/login', {
        'authjs.session-token': 'valid-token',
      })
      const response = await middleware(req)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe(
        '/dashboard/upcoming'
      )
    })
  })

  describe('protected routes', () => {
    it('redirects unauthenticated user to /login from /dashboard/upcoming', async () => {
      const req = createMiddlewareRequest('/dashboard/upcoming')
      const response = await middleware(req)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    })

    it('redirects unauthenticated user to /login from /dashboard/previous', async () => {
      const req = createMiddlewareRequest('/dashboard/previous')
      const response = await middleware(req)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    })

    it('allows authenticated user to access /dashboard/upcoming', async () => {
      const req = createMiddlewareRequest('/dashboard/upcoming', {
        'authjs.session-token': 'valid-token',
      })
      const response = await middleware(req)

      expect(response.status).toBe(200)
    })

    it('allows authenticated user to access /dashboard/previous', async () => {
      const req = createMiddlewareRequest('/dashboard/previous', {
        'authjs.session-token': 'valid-token',
      })
      const response = await middleware(req)

      expect(response.status).toBe(200)
    })
  })
})
