import { Router } from 'express'
import { uploadProductImage } from '../controllers/upload.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Admin-only: uploads to the Supabase Storage bucket and returns a public URL
router.post('/product-image', requireAuth, requireAdmin, uploadProductImage)

export default router
