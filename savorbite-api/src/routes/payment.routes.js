import { Router } from 'express'
import {
  initializePayment,
  verifyPayment,
  paystackCallback,
  paystackWebhook,
} from '../controllers/payment.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Initialize a provider transaction for an existing order
router.post('/initialize', requireAuth, initializePayment)

// Public verify endpoint — safe because it re-checks with Paystack server-side
router.get('/verify/:reference', verifyPayment)

// Paystack redirects the browser here; we bounce to the SPA confirmation page
router.get('/callback', paystackCallback)

// Paystack server webhook — the authoritative "mark paid" signal
router.post('/webhook/paystack', paystackWebhook)

export default router
