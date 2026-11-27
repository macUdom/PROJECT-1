import { supabaseAdmin } from '../config/supabase.js'
import env from '../config/env.js'
import { HttpError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { initializeTransaction, verifyTransaction, verifyWebhookSignature } from '../services/paystack.js'

// POST /api/payments/initialize — start a Paystack transaction for an order.
// Called after the order exists; the amount comes from OUR database, never
// from the client.
export const initializePayment = asyncHandler(async (req, res) => {
  const { orderId, provider = 'paystack' } = req.body
  if (provider !== 'paystack') {
    throw new HttpError(400, 'Only Paystack is enabled in this prototype. Flutterwave comes next.')
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, reference, customer_email, total_kobo, payment_status, status')
    .eq('id', orderId)
    .single()
  if (error || !order) throw new HttpError(404, 'Order not found.')
  // Customers can only pay for their own orders.
  if (order.user_id && order.user_id !== req.user.id) {
    throw new HttpError(403, 'You can only pay for your own orders.')
  }
  if (order.payment_status === 'Paid') {
    throw new HttpError(409, 'This order is already paid.')
  }

  const init = await initializeTransaction({
    email: order.customer_email,
    amountKobo: order.total_kobo,
    // Paystack redirects the customer back to the FRONTEND success page,
    // never to a backend route the SPA doesn't render.
    callbackUrl: `${env.frontendUrl}/payment/success`,
    metadata: { order_id: order.id, reference: order.reference },
    reference: order.reference,
  })

  const { error: refError } = await supabaseAdmin
    .from('orders')
    .update({ payment_provider: 'paystack', payment_reference: order.reference })
    .eq('id', order.id)
  if (refError) {
    console.error('[payments] failed to save payment_reference:', refError)
    throw new HttpError(500, 'Could not initialize payment.')
  }

  res.json({
    authorizationUrl: init.authorization_url,
    reference: init.reference,
    publicKey: env.paystack.publicKey,
  })
})

// GET /api/payments/verify/:reference — verify with Paystack and settle the
// order ONLY on a successful, amount-matching response. Safe to expose: it
// performs a server-side call with the secret key and compares amounts.
// Idempotent: refreshing or re-calling never double-processes the order.
export const verifyPayment = asyncHandler(async (req, res) => {
  let result
  try {
    result = await verifyTransaction(req.params.reference)
  } catch (e) {
    console.error('[payments] verifyPayment provider error:', e.message)
    // Return a friendly pending/failed shape instead of 502 so the SPA can
    // render the "not confirmed" state without crashing.
    const q = await supabaseAdmin
      .from('orders')
      .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
      .eq('payment_reference', req.params.reference)
      .single()
    const order = q.data || null
    return res.json({
      status: order ? order.payment_status : 'Pending',
      order: order ? serializeOrder(order, order.order_items || []) : { paymentStatus: 'Pending' },
      verified: false,
    })
  }

  await settleOrder(result)

  const fullOrder = await fetchFullOrder(req.params.reference)
  res.json({
    status: result.status,
    verified: result.status === 'success',
    order: fullOrder
      ? {
          ...serializeOrder(fullOrder, fullOrder.order_items || []),
          paymentStatus: fullOrder.payment_status,
        }
      : { paymentStatus: 'Pending' },
  })
})

// GET /api/payments/callback — Paystack redirects the browser here after the
// customer completes (or cancels) payment on Paystack's site. Verify, settle,
// then 302 to the frontend success page so the SPA owns the confirmation UI.
export const paystackCallback = asyncHandler(async (req, res) => {
  const reference = String(req.query.reference || req.query.trxref || '')
  const frontend = env.frontendUrl
  if (reference) {
    try {
      const result = await verifyTransaction(reference)
      await settleOrder(result)
    } catch (e) {
      console.error('[payments] callback verify failed:', e.message)
    }
  }
  res.redirect(302, `${frontend}/payment/success?reference=${encodeURIComponent(reference)}`)
})

// POST /api/payments/webhook/paystack — the authoritative "mark paid" signal.
// Backup in case the customer closes the tab before the redirect completes.
export const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature']
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body)

  if (!verifyWebhookSignature(raw, signature)) {
    throw new HttpError(401, 'Invalid webhook signature.')
  }

  const event = JSON.parse(raw)
  if (event.event === 'charge.success') {
    const reference = event.data?.reference
    const amount = event.data?.amount
    const status = event.data.status || 'success'
    if (reference) {
      await settleOrder({ status, reference, amountKobo: amount })
    }
  }
  res.json({ received: true })
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch the full order (with items) by payment reference or order reference.
 */
async function fetchFullOrder(reference) {
  const q1 = await supabaseAdmin
    .from('orders')
    .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
    .eq('payment_reference', reference)
    .single()
  if (q1.data) return q1.data
  const q2 = await supabaseAdmin
    .from('orders')
    .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
    .eq('reference', reference)
    .single()
  return q2.data || null
}

/**
 * Marks the order Paid (+ status "confirmed") when the provider confirms
 * success AND the paid amount matches what we charged.
 *
 * Idempotent: if the order is already Paid, stock is not decremented again and
 * no duplicate work happens, so a repeated webhook or page refresh is safe.
 */
async function settleOrder(result) {
  if (result.status !== 'success') {
    console.error('[payments] settleOrder skipped: non-success status', result.status, result.reference)
    return { paymentStatus: 'Pending' }
  }

  let order = null
  const lookup = await supabaseAdmin
    .from('orders')
    .select('id, total_kobo, payment_status, payment_reference, status, reference')
    .eq('payment_reference', result.reference)
    .single()
  if (lookup.data) {
    order = lookup.data
  } else {
    const lookup2 = await supabaseAdmin
      .from('orders')
      .select('id, total_kobo, payment_status, payment_reference, status, reference')
      .eq('reference', result.reference)
      .single()
    if (lookup2.data) {
      order = lookup2.data
      await supabaseAdmin.from('orders').update({ payment_reference: result.reference }).eq('id', order.id)
    }
  }
  if (!order) {
    console.error('[payments] No order matches payment_reference:', result.reference)
    throw new HttpError(404, 'No order matches this payment reference.')
  }

  if (result.amountKobo && Number(result.amountKobo) !== Number(order.total_kobo)) {
    console.error(`[payments] MISMATCH order=${order.id} expected=${order.total_kobo} got=${result.amountKobo}`)
    throw new HttpError(409, 'Paid amount does not match the order total. Support has been notified.')
  }

  // Idempotent: only transition an unpaid order once.
  if (order.payment_status !== 'Paid') {
    // Load order items to decrement stock exactly once.
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id)

    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'Paid',
        status: 'confirmed',
        payment_provider: 'paystack',
        payment_reference: result.reference,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    // Decrement stock for each item exactly once.
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.product_id) {
          try {
            const { data: product } = await supabaseAdmin
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single()
            if (product) {
              const newStock = Math.max(0, (product.stock || 0) - (item.quantity || 0))
              await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.product_id)
            }
          } catch (e) {
            console.error('[payments] stock decrement failed for product', item.product_id, e.message)
          }
        }
      }
    }
  }

  return { paymentStatus: 'Paid' }
}

// Shape kobo-based rows into the naira/keywords the SPA expects.
function serializeOrder(row, items) {
  return {
    id: row.id,
    reference: row.reference,
    userId: row.user_id,
    customer: { name: row.customer_name, phone: row.customer_phone, email: row.customer_email },
    address: row.address,
    notes: row.notes,
    deliveryMethod: row.delivery_method,
    subtotal: row.subtotal_kobo / 100,
    deliveryFee: row.delivery_fee_kobo / 100,
    total: row.total_kobo / 100,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentProvider: row.payment_provider,
    paymentReference: row.payment_reference,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    items: (items || []).map((i) => ({
      id: i.product_id,
      name: i.name,
      price: i.unit_price_kobo / 100,
      quantity: i.quantity,
    })),
  }
}
