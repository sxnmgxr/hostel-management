const BASE = ''

async function throwApiError(res: Response, method: string, path: string): Promise<never> {
  const errorBody = await res.json().catch(() => null)
  const error = errorBody?.error
  const message = typeof error === 'string'
    ? error
    : error?.formErrors?.join(', ') || `${method} ${path} failed`
  throw new Error(message)
}

export async function apiGet(path: string) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) await throwApiError(res, 'GET', path)
  return res.json()
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) await throwApiError(res, 'POST', path)
  return res.json()
}

export async function apiPut(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) await throwApiError(res, 'PUT', path)
  return res.json()
}

export async function apiDelete(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) await throwApiError(res, 'DELETE', path)
  return res.json()
}