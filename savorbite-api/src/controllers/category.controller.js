import { supabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/categories — public.
export const listCategories = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, blurb, image_url')
    .order('name', { ascending: true })
  if (error) throw new HttpError(500, 'Could not load categories.')
  res.json({ categories: data })
})

const parseCategoryPayload = (body) => {
  const payload = {}
  if (body.name !== undefined) {
    if (String(body.name).trim().length < 2) throw new HttpError(400, 'Enter a category name (at least 2 characters).')
    payload.name = String(body.name).trim()
  }
  if (body.blurb !== undefined) payload.blurb = String(body.blurb)
  if (body.image_url !== undefined) payload.image_url = body.image_url
  return payload
}

// POST /api/categories (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const payload = parseCategoryPayload(req.body)
  if (!payload.name) throw new HttpError(400, 'Category name is required.')
  const { data, error } = await supabaseAdmin.from('categories').insert(payload).select().single()
  if (error) throw new HttpError(500, 'Could not create this category.')
  res.status(201).json({ category: data })
})

// PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const payload = parseCategoryPayload(req.body)
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single()
  if (error || !data) throw new HttpError(404, 'Category not found.')
  res.json({ category: data })
})

// DELETE /api/categories/:id (admin) — blocked while dishes still reference it.
export const deleteCategory = asyncHandler(async (req, res) => {
  const { count } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', req.params.id)
  if (count > 0) {
    throw new HttpError(
      409,
      `${count} product${count === 1 ? '' : 's'} still sit under this category. Move or delete them first.`
    )
  }
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', req.params.id)
  if (error) throw new HttpError(500, 'Could not delete this category.')
  res.json({ ok: true })
})
