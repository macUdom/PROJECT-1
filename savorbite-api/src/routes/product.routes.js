import { Router } from 'express'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Public catalogue
router.get('/', listProducts)
router.get('/:id', getProduct)

// Admin-only management (role verified from the DB, not the request body)
router.post('/', requireAuth, requireAdmin, createProduct)
router.put('/:id', requireAuth, requireAdmin, updateProduct)
router.delete('/:id', requireAuth, requireAdmin, deleteProduct)

export default router
