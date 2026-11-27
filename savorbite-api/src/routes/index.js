import { Router } from 'express'
import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import categoryRoutes from './category.routes.js'
import orderRoutes from './order.routes.js'
import paymentRoutes from './payment.routes.js'
import uploadRoutes from './upload.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)
router.use('/orders', orderRoutes)
router.use('/payments', paymentRoutes)
router.use('/uploads', uploadRoutes)

export default router
