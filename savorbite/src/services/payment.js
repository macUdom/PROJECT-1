// Payment service — PLACEHOLDER for Paystack / Flutterwave.
//
// SECURITY NOTES (front end only):
// - Never put secret keys (paystack_sk_*, flutterwave_secret_*) in front-end code.
// - The public key (e.g. paystack_public_*) initializes the provider inline script
//   and must come from an environment variable, never hard-coded.
// - Payment success is NEVER trusted from the browser. After the provider callback,
//   the Express backend verifies the reference with its secret key and only then
//   marks the order paid. The UI shows "Pending" until that server verification.
//
// Set these in .env.local when wiring the real backend (do not commit):
//   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
//   VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxx
//   VITE_API_BASE_URL=https://api.savorbite.example

export const paymentProviders = [
  {
    id: 'paystack',
    name: 'Paystack',
    note: 'Card, bank transfer, USSD',
    publicKeyEnv: 'VITE_PAYSTACK_PUBLIC_KEY',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    note: 'Card, bank, mobile money',
    publicKeyEnv: 'VITE_FLUTTERWAVE_PUBLIC_KEY',
  },
]

function isMockMode() {
  // Mock mode keeps the prototype runnable without backend keys.
  return !import.meta.env.VITE_PAYSTACK_PUBLIC_KEY && !import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const newReference = () =>
  'ref_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/**
 * Step 1: initialize a payment with the provider.
 * Real implementation: load the provider inline JS with the public key from env
 * and call PaystackPop.setup({ key, email, amount, ref }) / FlutterwaveCheckout({...}).
 */
export async function initializePayment({ provider, amountKobo, email }) {
  await delay(900)
  if (!isMockMode()) {
    throw new Error('Live payment initialization is not implemented in this prototype.')
  }
  const reference = newReference()
  // Persisted on the server in the real app (Order.payment_reference).
  return { reference, provider, status: 'initialized' }
}

/**
 * Step 2: ask the SERVER to verify the reference with the secret key.
 * Real implementation: GET /api/payments/verify?reference=... on the Express API.
 * The response `status` comes from the payment provider via the server.
 */
export async function verifyPaymentOnServer(reference) {
  await delay(1300)
  // PLACEHOLDER: do not decide payment status on the client in production.
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  void base
  return { reference, status: 'success', verified: true }
}

export const PAYMENT_MOCK_MODE = isMockMode()
