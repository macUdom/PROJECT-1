import { supabaseAnon } from '../config/supabase.js'
import { supabaseAdmin } from '../config/supabase.js'

// Verifies the Supabase access token (sent as `Authorization: Bearer <jwt>`)
// and attaches { id, email, role } to req.user. Role comes from the profiles
// table — never from client-supplied data.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      console.log('[auth] No token provided for', req.method, req.originalUrl)
      return res.status(401).json({ error: 'No token provided. Please sign in.' })
    }
    const { data, error } = await supabaseAnon.auth.getUser(token)
    if (error || !data?.user) {
      const isExpired = error?.message?.toLowerCase().includes('expired')
      console.log(`[auth] ${isExpired ? 'Token expired' : 'Invalid token'} for`, req.method, req.originalUrl, '::', error?.message)
      return res.status(401).json({
        error: isExpired ? 'Token expired. Please sign in again.' : 'Invalid token. Please sign in again.',
      })
    }
    req.authToken = token
    req.user = { id: data.user.id, email: data.user.email }
    return next()
  } catch (e) {
    return next(e)
  }
}

// Loads the caller's profile (role) from the database. Placeholder role logic
// for the admin guard — same contract the Vue router expects.
export async function requireAdmin(req, res, next) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', req.user.id)
      .single()
    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only. This account cannot perform admin actions.' })
    }
    req.user.role = profile.role
    req.user.name = profile.full_name
    return next()
  } catch (e) {
    return next(e)
  }
}

// Optional auth: attaches req.user when a valid token is present, but allows
// anonymous requests through (public catalogue endpoints).
export async function attachUserIfPresent(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (token) {
      const { data } = await supabaseAnon.auth.getUser(token)
      if (data?.user) req.user = { id: data.user.id, email: data.user.email }
    }
  } catch {
    /* anonymous is fine for public routes */
  }
  return next()
}
