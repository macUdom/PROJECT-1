import { supabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { priceOrder, generateOrderReference } from '../services/orderPricing.js'

// POST /api/orders — creates an order with SERVER-COMPUTED totals.
// The client sends only item ids + quantities + delivery/contact details.
export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryMethod, customer, address, notes } = req.body

  if (!customer?.name || !customer?.phone || !customer?.email) {
    throw new HttpError(400, 'Contact details (name, phone, email) are required.')
  }
  const phoneDigits = String(customer.phone).replace(/\s/g, '')
  if (!/^(\+?234|0)[789]\d{9}$/.test(phoneDigits)) {
    throw new HttpError(400, 'Enter a valid Nigerian phone number, e.g. 0803 123 4567.')
  }
  if (String(address || '').trim().length < 10) {
    throw new HttpError(400, 'Add street and area for delivery, e.g. “14b Adeola Odeku Street, VI”.')
  }

  // Authoritative totals from DB prices
  const priced = await priceOrder(items, deliveryMethod)

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      reference: generateOrderReference(),
      user_id: req.user.id,
      customer_name: customer.name.trim(),
      customer_phone: phoneDigits,
      customer_email: customer.email.trim().toLowerCase(),
      address: address.trim(),
      notes: notes ? String(notes).slice(0, 500) : null,
      subtotal_kobo: priced.subtotalKobo,
      delivery_fee_kobo: priced.deliveryFeeKobo,
      total_kobo: priced.totalKobo,
      delivery_method: deliveryMethod === 'express' ? 'express' : 'standard',
      status: 'Pending',
      payment_status: 'Pending',
    })
    .select()
    .single()
  if (error) throw new HttpError(500, 'Could not record your order. Please try again.')

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(priced.items.map((i) => ({ ...i, order_id: order.id })))
  if (itemsError) {
    // Keep the order (payment never initiated) but flag it for the admin.
    throw new HttpError(500, 'Order created but items could not be saved. Contact support with your reference.')
  }

  res.status(201).json({ order: serializeOrder(order, priced.items) })
})

// GET /api/orders/mine — signed-in customer’s history.
export const listMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
  if (error) throw new HttpError(500, 'Could not load your orders.')
  res.json({ orders: data.map((o) => serializeOrder(o, o.order_items)) })
})

// GET /api/orders — all orders (admin only).
export const listOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query
  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
    .order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  if (search) {
    const sanitized = String(search).replace(/[,()%]/g, '').trim()
    if (sanitized) query = query.or(`reference.ilike.%${sanitized}%,customer_name.ilike.%${sanitized}%`)
  }

  const { data, error } = await query
  if (error) throw new HttpError(500, 'Could not load orders.')
  res.json({ orders: data.map((o) => serializeOrder(o, o.order_items)) })
})

const NEXT_STATUSES_PAID = {
  Pending: ['confirmed', 'Cancelled'],
  confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Out for delivery', 'Cancelled'],
  'Out for delivery': ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
}

const NEXT_STATUSES_UNPAID = {
  Pending: ['Cancelled'],
  Paid: ['Cancelled'],
  Preparing: ['Cancelled'],
  'Out for delivery': ['Cancelled'],
  Delivered: [],
  Cancelled: [],
}

// PATCH /api/orders/:id/status — progress updates (admin only).
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', req.params.id)
    .single()
  if (fetchError || !order) throw new HttpError(404, 'Order not found.')

  if (order.payment_status !== 'Paid') {
    if (status !== 'Cancelled') {
      throw new HttpError(403, "This order hasn't been paid yet.")
    }
  } else {
    const allowed = NEXT_STATUSES_PAID[order.status] || []
    if (!allowed.includes(status)) {
      throw new HttpError(
        409,
        `An order that is "${order.status}" can't move to "${status}". Allowed next: ${allowed.join(', ') || 'none (final state)'}`
      )
    }
  }

  if (status === 'Cancelled' && order.payment_status === 'Paid' && order.status !== 'Cancelled') {
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id)
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
              const newStock = (product.stock || 0) + (item.quantity || 0)
              await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.product_id)
            }
          } catch (e) {
            console.error('[orders] stock restore failed', e.message)
          }
        }
      }
    }
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', order.id)
    .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
    .single()
  if (error) throw new HttpError(500, 'Could not update the order status.')
  res.json({ order: serializeOrder(data, data.order_items || []) })
})

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
    items: (items || []).map((i) => ({
      id: i.product_id,
      name: i.name,
      price: i.unit_price_kobo / 100,
      quantity: i.quantity,
    })),
  }
}
