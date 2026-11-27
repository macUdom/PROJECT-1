import { supabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/products?category=&search= — public menu listing.
export const listProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query
  let query = supabaseAdmin
    .from('products')
    .select('id, name, description, unit, price_kobo, stock, available, featured, category_id, categories(name), product_images(url, position)')
    .order('featured', { ascending: false })
    .order('name', { ascending: true })

  if (category && category !== 'all') query = query.eq('category_id', category)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) throw new HttpError(500, 'Could not load the menu. Please try again.')

  res.json({
    products: data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      unit: p.unit,
      price: p.price_kobo / 100, // naira for display
      priceKobo: p.price_kobo,
      stock: p.stock,
      available: p.available,
      featured: p.featured,
      category: p.category_id,
      categoryName: p.categories?.name,
      images: (p.product_images || []).sort((a, b) => a.position - b.position).map((i) => i.url),
    })),
  })
})

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const { data: p, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name), product_images(url, position)')
    .eq('id', req.params.id)
    .single()
  if (error || !p) throw new HttpError(404, 'This dish isn’t on the menu.')

  res.json({
    product: {
      id: p.id,
      name: p.name,
      description: p.description,
      unit: p.unit,
      price: p.price_kobo / 100,
      priceKobo: p.price_kobo,
      stock: p.stock,
      available: p.available,
      featured: p.featured,
      category: p.category_id,
      categoryName: p.categories?.name,
      images: (p.product_images || []).sort((a, b) => a.position - b.position).map((i) => i.url),
    },
  })
})

const parseProductPayload = (body) => {
  const { name, description, unit, price, stock, available, featured, category_id, images } = body
  const payload = {}
  if (name !== undefined) {
    if (String(name).trim().length < 2) throw new HttpError(400, 'Enter the dish name (at least 2 characters).')
    payload.name = String(name).trim()
  }
  if (description !== undefined) payload.description = String(description)
  if (unit !== undefined) payload.unit = String(unit)
  if (category_id !== undefined) payload.category_id = category_id
  if (price !== undefined) {
    const naira = Number(price)
    if (!Number.isFinite(naira) || naira <= 0) throw new HttpError(400, 'Enter a price above ₦0.')
    payload.price_kobo = Math.round(naira * 100)
  }
  if (stock !== undefined) {
    const n = Number(stock)
    if (!Number.isInteger(n) || n < 0) throw new HttpError(400, 'Stock must be a whole number of 0 or more.')
    payload.stock = n
    payload.available = n > 0 // stock 0 ⇒ sold out
  }
  if (available !== undefined && stock === undefined) payload.available = Boolean(available)
  if (featured !== undefined) payload.featured = Boolean(featured)
  if (Array.isArray(images)) payload.images = images.slice(0, 5)
  return payload
}

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const payload = parseProductPayload(req.body)
  if (!payload.name || !payload.price_kobo || !payload.category_id) {
    throw new HttpError(400, 'Name, category and price are required.')
  }

  const { images, ...row } = payload
  const { data, error } = await supabaseAdmin.from('products').insert(row).select().single()
  if (error) throw new HttpError(500, 'Could not save this product. Please try again.')

  if (images?.length) {
    await supabaseAdmin
      .from('product_images')
      .insert(images.map((url, position) => ({ product_id: data.id, url, position })))
  }

  res.status(201).json({ product: { id: data.id, ...data, price: data.price_kobo / 100 } })
})

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const payload = parseProductPayload(req.body)
  const { images, ...row } = payload

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(row)
    .eq('id', req.params.id)
    .select()
    .single()
  if (error || !data) throw new HttpError(404, 'Product not found.')

  if (images) {
    // Replace the photo set (positions 0..n, first is the cover).
    await supabaseAdmin.from('product_images').delete().eq('product_id', data.id)
    if (images.length) {
      await supabaseAdmin
        .from('product_images')
        .insert(images.map((url, position) => ({ product_id: data.id, url, position })))
    }
  }

  res.json({ product: { id: data.id, ...data, price: data.price_kobo / 100 } })
})

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  // Orders keep their item snapshots, so deleting a product is safe for history.
  const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id)
  if (error) throw new HttpError(500, 'Could not delete this product.')
  res.json({ ok: true })
})
