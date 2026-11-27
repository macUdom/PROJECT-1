import 'dotenv/config'
import { supabaseAdmin } from '../src/config/supabase.js'
import { verifyTransaction } from '../src/services/paystack.js'

async function settleOrderByReference(reference) {
  try {
    const result = await verifyTransaction(reference)
    console.log('verify result:', result)
    if (result.status !== 'success') {
      console.log('not success for', reference)
      return
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, total_kobo, payment_status, payment_reference, status')
      .eq('payment_reference', result.reference)
      .single()

    if (error || !order) {
      // Try to find by id/reference pattern? maybe reference different
      const { data: order2 } = await supabaseAdmin
        .from('orders')
        .select('id, total_kobo, payment_status, payment_reference, status, reference')
        .ilike('reference', '%' + reference.slice(-5) + '%')
        .limit(1)
        .maybeSingle()
      if (!order2) {
        console.error('no order for', reference)
        return
      }
      // Update to match
      await supabaseAdmin
        .from('orders')
        .update({ payment_reference: result.reference, payment_provider: 'paystack' })
        .eq('id', order2.id)
    }

    const orderToSettle = order || (await supabaseAdmin
      .from('orders')
      .select('id, total_kobo, payment_status, payment_reference, status')
      .eq('payment_reference', result.reference)
      .single()).data

    if (!orderToSettle) return

    if (result.amountKobo && Number(result.amountKobo) !== Number(orderToSettle.total_kobo)) {
      console.error('amount mismatch', orderToSettle.id)
      return
    }

    if (orderToSettle.payment_status !== 'Paid') {
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderToSettle.id)

      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'Paid',
          payment_provider: 'paystack',
          payment_reference: result.reference,
          paid_at: new Date().toISOString(),
          status: orderToSettle.status === 'Pending' ? 'Paid' : orderToSettle.status,
        })
        .eq('id', orderToSettle.id)

      if (items && items.length > 0) {
        for (const item of items) {
          if (item.product_id) {
            const { data: product } = await supabaseAdmin
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single()
            if (product) {
              const newStock = Math.max(0, (product.stock || 0) - (item.quantity || 0))
              await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.product_id)
            }
          }
        }
      }
      console.log('settled', orderToSettle.id)
    } else {
      console.log('already paid', orderToSettle.id)
    }
  } catch (e) {
    console.error('err', e.message)
  }
}

const refs = process.argv.slice(2)
if (refs.length === 0) {
  console.log('usage: node scripts/settlePaidOrders.js T281957503551970 ...')
  process.exit(0)
}
for (const r of refs) {
  await settleOrderByReference(r)
}
process.exit(0)
