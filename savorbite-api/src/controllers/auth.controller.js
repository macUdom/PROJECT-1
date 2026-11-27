import { supabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// POST /api/auth/register — creates the Supabase auth user + profile row.
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true, // prototype: auto-confirm; production should email-verify
    user_metadata: { full_name: name.trim(), phone },
  })
  if (createError) {
    const status = createError.status || 400
    throw new HttpError(status, createError.message || 'Could not create that account.')
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: created.user.id, full_name: name.trim(), phone, role: 'customer' })
  if (profileError) throw new HttpError(500, 'Account created but the profile could not be saved. Contact support.')

  // Sign the new user in so the SPA gets an access token immediately.
  const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (signInError) throw new HttpError(500, 'Account created. Please sign in to continue.')

  res.status(201).json({
    user: { id: created.user.id, name: name.trim(), email: created.user.email, role: 'customer' },
    session: { access_token: session.session.access_token, expires_at: session.session.expires_at },
  })
})

// POST /api/auth/login — password sign-in via Supabase Auth.
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password,
  })
  if (error || !data?.session) {
    // Same generic message for "no account" and "wrong password" (don't leak
    // which emails are registered).
    throw new HttpError(401, 'Incorrect email or password. Check your details or create an account.')
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name, phone')
    .eq('id', data.user.id)
    .single()

  res.json({
    user: {
      id: data.user.id,
      name: profile?.full_name || data.user.user_metadata?.full_name || 'Customer',
      email: data.user.email,
      phone: profile?.phone,
      role: profile?.role || 'customer',
    },
    session: { access_token: data.session.access_token, expires_at: data.session.expires_at },
  })
})

// GET /api/auth/me — profile of the signed-in user.
export const me = asyncHandler(async (req, res) => {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name, phone')
    .eq('id', req.user.id)
    .single()

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: profile?.full_name || 'Customer',
      phone: profile?.phone,
      role: profile?.role || 'customer',
    },
  })
})
