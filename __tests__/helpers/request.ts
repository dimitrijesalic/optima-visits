import { NextRequest } from 'next/server'

export function createRequest(
  url: string,
  options?: { method?: string; body?: unknown }
): NextRequest {
  const { method = 'GET', body } = options ?? {}

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    ...(body
      ? {
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        }
      : {}),
  })
}
