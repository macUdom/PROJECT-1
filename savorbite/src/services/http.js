const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const AUTH_TOKEN_KEY = 'savorbite_auth_token'

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

function headers() {
  const token = getAuthToken()
  const h = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body || {}) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || res.statusText
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}

export const http = {
  async get(path) {
    return request('GET', path)
  },

  async post(path, body) {
    return request('POST', path, body)
  },

  async patch(path, body) {
    return request('PATCH', path, body)
  },

  async put(path, body) {
    return request('PUT', path, body)
  },

  async delete(path, body) {
    return request('DELETE', path, body)
  },
}
