import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from '../config/supabase.js'
import env from '../config/env.js'
import { HttpError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

// POST /api/uploads/product-image (admin) — stores the file in the Supabase
// Storage bucket and returns its public URL for the product_images table.
export const uploadProductImage = asyncHandler(async (req, res) => {
  const { dataUrl } = req.body
  if (!dataUrl || !/^data:image\/(jpeg|png|webp|avif);base64,/.test(dataUrl)) {
    throw new HttpError(400, 'Send a base64 image (JPEG, PNG, WebP or AVIF, max 5MB).')
  }

  const mime = dataUrl.slice(5, dataUrl.indexOf(';'))
  if (!ALLOWED.has(mime)) throw new HttpError(400, 'Unsupported image type. Use JPEG, PNG, WebP or AVIF.')

  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  if (buffer.byteLength > MAX_BYTES) throw new HttpError(400, 'Image too large. Pick a file under 5MB.')

  const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1]
  const path = `products/${new Date().getFullYear()}/${randomUUID()}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(env.supabase.storageBucket)
    .upload(path, buffer, { contentType: mime, upsert: false })
  if (uploadError) throw new HttpError(500, `Upload failed: ${uploadError.message}`)

  const { data: pub } = supabaseAdmin.storage.from(env.supabase.storageBucket).getPublicUrl(path)
  res.status(201).json({ url: pub.publicUrl, path })
})
