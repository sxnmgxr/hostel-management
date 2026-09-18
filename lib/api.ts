const BASE = ''

export async function apiGet(path: string) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET ${path} failed`)
  return res.json()
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed`)
  return res.json()
}

export async function apiPut(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT ${path} failed`)
  return res.json()
}

export async function apiDelete(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE ${path} failed`)
  return res.json()
}