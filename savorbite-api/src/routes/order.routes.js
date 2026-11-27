import { Router } from 'express'
import {
  createOrder,
  listMyOrders,
  listOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Customer endpoints (auth required)
router.post('/', requireAuth, createOrder)
router.get('/mine', requireAuth, listMyOrders)

// Admin endpoints
router.get('/', requireAuth, requireAdmin, listOrders)
router.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatus)

export default router
