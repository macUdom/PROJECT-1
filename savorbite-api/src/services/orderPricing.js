import { supabaseAdmin } from '../config/supabase.js'
import { HttpError } from '../middleware/errorHandler.js'

// Prices are stored in kobo (integer) in Postgres to avoid float rounding.
export const DELIVERY = {
  standardFeeKobo: 50000, // ₦500
  freeOverKobo: 500000, // free standard delivery over ₦5,000
  expressFeeKobo: 150000, // ₦1,500 flat
}

/**
 * Recomputes the entire order total from DB prices. The client may only send
 * item ids + quantities and a delivery method — any client-side prices,
 * subtotals or totals in the request are ignored. Returns the authoritative
 * amounts plus DB-sourced item snapshots.
 */
export async function priceOrder(items, deliveryMethod) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'Your cart is empty — add at least one dish to place an order.')
  }
  if (items.length > 30) {
    throw new HttpError(400, 'You can order at most 30 different dishes per order. Call us for events.')
  }

  const ids = items.map((i) => i.id)
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name, price_kobo, stock, available')
    .in('id', ids)
  if (error) throw new HttpError(500, 'Could not load current menu prices. Please try again.')

  const byId = new Map(products.map((p) => [p.id, p]))
  const priced = []
  let subtotalKobo = 0

  for (const item of items) {
    const product = byId.get(item.id)
    if (!product) throw new HttpError(400, `“${item.id}” is not on the menu. Refresh the page and try again.`)
    if (!product.available || product.stock < 1) {
      throw new HttpError(409, `${product.name} just sold out. Please remove it from your cart.`)
    }
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(400, `Quantity for ${product.name} must be a whole number of 1 or more.`)
    }
    if (quantity > product.stock) {
      throw new HttpError(409, `Only ${product.stock} of ${product.name} left today. Reduce the quantity to ${product.stock}.`)
    }
    priced.push({
      product_id: product.id,
      name: product.name,
      unit_price_kobo: product.price_kobo,
      quantity,
    })
    subtotalKobo += product.price_kobo * quantity
  }

  let deliveryFeeKobo = 0
  if (deliveryMethod === 'express') {
    deliveryFeeKobo = DELIVERY.expressFeeKobo
  } else if (subtotalKobo < DELIVERY.freeOverKobo) {
    deliveryFeeKobo = DELIVERY.standardFeeKobo
  }

  return {
    items: priced,
    subtotalKobo,
    deliveryFeeKobo,
    totalKobo: subtotalKobo + deliveryFeeKobo,
  }
}

// Generates a human-friendly order reference like SB-48210.
export function generateOrderReference() {
  return 'SB-' + String(Math.floor(10000 + Math.random() * 89999))
}
