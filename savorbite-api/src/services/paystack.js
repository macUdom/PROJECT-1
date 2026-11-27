import axios from 'axios'
import { createHmac, timingSafeEqual } from 'node:crypto'
import env from '../config/env.js'
import { HttpError } from '../middleware/errorHandler.js'

const PAYSTACK_BASE = 'https://api.paystack.co'

const client = axios.create({
  baseURL: PAYSTACK_BASE,
  headers: {
    Authorization: `Bearer ${env.paystack.secretKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

// Amounts are always passed in kobo (integer) — never floats, never naira.
export async function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata = {} }) {
  try {
    const payload = {
      email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata,
    }
    const { data } = await client.post('/transaction/initialize', payload)
    return data.data // { authorization_url, access_code, reference }
  } catch (e) {
    const message = e.response?.data?.message || 'Could not reach the payment provider.'
    console.error('[paystack] initialize error:', message, e.response?.data)
    throw new HttpError(502, `Paystack: ${message}`)
  }
}

// THE critical server-side check: only the provider's verify response may mark
// an order paid. The browser is never trusted for payment status.
export async function verifyTransaction(reference) {
  try {
    const { data } = await client.get(`/transaction/verify/${encodeURIComponent(reference)}`)
    const result = data.data
    return {
      status: result.status, // 'success' | 'failed' | 'abandoned' | ...
      amountKobo: result.amount,
      paidAt: result.paid_at,
      channel: result.channel,
      reference: result.reference,
    }
  } catch (e) {
    const message = e.response?.data?.message || 'Could not verify the payment with the provider.'
    console.error('[paystack] verify error:', message, e.response?.data)
    throw new HttpError(502, `Paystack: ${message}`)
  }
}

// Verifies the x-paystack-signature HMAC-SHA512 of the raw webhook body.
export function verifyWebhookSignature(rawBody, signature) {
  if (!rawBody || !signature) return false
  try {
    const expected = createHmac('sha512', env.paystack.secretKey).update(rawBody).digest('hex')
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(String(signature), 'utf8')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
