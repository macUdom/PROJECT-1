const fs = require('fs');
const path = 'C:\\Users\\user\\Desktop\\PROJECT 1\\savorbite-api\\src\\controllers\\payment.controller.js';
let content = fs.readFileSync(path, 'utf8');

const old = `// GET /api/payments/verify/:reference — verify with Paystack and settle the
// order ONLY on a successful, amount-matching response. Safe to expose: it
// performs a server-side call with the secret key and compares amounts.
export const verifyPayment = asyncHandler(async (req, res) => {
  const result = await verifyTransaction(req.params.reference)
  const order = await settleOrder(result)
  res.json({ status: result.status, order })
})`;

const neu = `// GET /api/payments/verify/:reference — verify with Paystack and settle the
// order ONLY on a successful, amount-matching response. Safe to expose: it
// performs a server-side call with the secret key and compares amounts.
export const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const result = await verifyTransaction(req.params.reference)
    await settleOrder(result)
    const { data: fullOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(product_id, name, unit_price_kobo, quantity)')
      .eq('payment_reference', req.params.reference)
      .single()
    res.json({
      status: result.status,
      order: fullOrder
        ? {
            id: fullOrder.id,
            reference: fullOrder.reference,
            paymentStatus: fullOrder.payment_status,
            paymentReference: fullOrder.payment_reference,
            paymentProvider: fullOrder.payment_provider,
            status: fullOrder.status,
            total: fullOrder.total_kobo / 100,
          }
        : { paymentStatus: 'Pending' },
    })
  } catch (e) {
    console.error('[payments] verifyPayment error:', e.message)
    throw e
  }
})`;

if (content.includes(old)) {
  content = content.replace(old, neu);
  fs.writeFileSync(path, content);
  console.log('updated');
} else {
  console.log('not found');
}
