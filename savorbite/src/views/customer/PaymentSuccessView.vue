<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { http } from '@/services/http'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import {
  formatNaira,
  addMinutes,
  formatClockTime,
  ETA_MIN_MINUTES,
  ETA_MAX_MINUTES,
} from '@/constants'

const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()

const headingRef = ref(null)
const status = ref('loading') // loading | success | failed | pending | invalid
const order = ref(null)
const verifyError = ref(null)

const reference = route.query.reference || route.query.trxref || ''

const firstName = (name) => (name || '').trim().split(' ')[0] || 'there'

async function verifyPayment() {
  if (!reference) {
    status.value = 'invalid'
    return
  }
  try {
    const res = await http.get(`/payments/verify/${encodeURIComponent(reference)}`)
    order.value = res.order || null
    if (res.verified && order.value && order.value.paymentStatus === 'Paid') {
      status.value = 'success'
      // Clear the cart only now that the server has verified the payment.
      cart.clear()
      return
    }
    // Verified but not yet paid (or provider returned non-success).
    status.value = 'pending'
  } catch (e) {
    verifyError.value = e.message || 'Could not verify the payment.'
    status.value = 'failed'
  }
}

function retry() {
  status.value = 'loading'
  verifyError.value = null
  verifyPayment()
}

onMounted(() => {
  verifyPayment()
})

// Focus the heading on load so screen-reader users land on the outcome.
watch(
  () => status.value,
  () => {
    if (headingRef.value) headingRef.value.focus()
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-12 md:px-6 lg:py-16">
    <div class="rounded-xl border border-line bg-surface p-6 md:p-8 shadow-sm" aria-live="polite" aria-atomic="true">

      <!-- Loading state -->
      <template v-if="status === 'loading'">
        <div class="flex flex-col items-center gap-3 text-center">
          <span class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-sand">
            <span class="h-7 w-7 animate-spin rounded-full border-2 border-paprika border-t-transparent" aria-hidden="true" />
          </span>
          <h2 ref="headingRef" tabIndex="-1" class="text-h1 font-display font-bold text-charcoal">
            Confirming your payment…
          </h2>
          <p class="mt-2 text-body text-muted">We’re verifying with Paystack. This may take a few seconds.</p>
        </div>
      </template>

      <!-- Success state -->
      <template v-else-if="status === 'success'">
        <div class="flex flex-col items-center gap-4 text-center">
          <span class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-success/10 border border-success/20 ring-4 ring-success/5">
            <Icon name="check" :size="34" class="text-success" />
          </span>

          <h1 ref="headingRef" tabIndex="-1" class="text-h1 font-display font-bold text-charcoal">
            PAYMENT SUCCESSFUL
          </h1>
          <p class="mt-1 text-body-lg text-charcoal">
            Thank you, {{ firstName(order?.customer?.name) }}! Your order is confirmed.
          </p>

          <!-- Order summary card -->
          <section class="mt-6 rounded-lg border border-line bg-cream p-5 text-left">
            <h2 class="text-h2 font-display font-semibold text-charcoal mb-3">Your order</h2>
            <OrderSummary
              :items="order.items"
              :subtotal="order.subtotal"
              :delivery-fee="order.deliveryFee"
              :total="order.total"
              :delivery-method="order.deliveryMethod"
            />
            <dl class="mt-5 divide-y divide-line text-body-sm">
              <div class="flex justify-between py-2">
                <dt class="text-muted">Order number</dt>
                <dd class="tabular-nums font-semibold text-charcoal">{{ order.reference || order.id }}</dd>
              </div>
              <div class="flex justify-between py-2">
                <dt class="text-muted">Payment reference</dt>
                <dd class="tabular-nums text-muted">{{ order.paymentReference || order.reference }}</dd>
              </div>
              <div class="flex justify-between py-2">
                <dt class="text-muted">Payment method</dt>
                <dd class="text-muted">{{ (order.paymentProvider || 'paystack').charAt(0).toUpperCase() + (order.paymentProvider || 'paystack').slice(1) }}</dd>
              </div>
              <div class="flex justify-between py-2">
                <dt class="text-muted">Delivery address</dt>
                <dd class="text-muted">{{ order.address }}</dd>
              </div>
            </dl>
          </section>

          <!-- Estimated arrival card -->
          <section class="mt-6 rounded-xl border border-paprika/20 bg-paprika/5 p-5 text-left">
            <div class="flex items-center gap-2.5 mb-2">
              <Icon name="clock" :size="18" class="text-paprika shrink-0" />
              <span class="text-body-sm font-semibold text-charcoal">Estimated arrival</span>
            </div>
            <p class="mt-0.5 text-body text-muted">
              {{ ETA_MIN_MINUTES }}–{{ ETA_MAX_MINUTES }} minutes
            </p>
            <p class="mt-1 text-body text-charcoal font-semibold tabular-nums">
              Around {{
                formatClockTime(addMinutes(order?.paidAt || order?.createdAt, ETA_MIN_MINUTES))
              }} –
              {{
                formatClockTime(addMinutes(order?.paidAt || order?.createdAt, ETA_MAX_MINUTES))
              }}
            </p>
            <p class="mt-2 text-body-xs text-muted">
              Prepared fresh and delivered to {{ order.address.split(',')[0] || 'your address' }}.
            </p>
          </section>

          <div class="mt-7 flex flex-col sm:flex-row gap-3 justify-center w-full">
            <Button
              to="/shop"
              size="lg"
              class="w-full sm:w-auto"
              icon="arrowRight"
            >
              Continue Shopping
            </Button>
            <Button
              :to="auth.isAuthenticated ? { name: 'orders' } : '/'"
              size="lg"
              variant="ghost"
              class="w-full sm:w-auto"
            >
              {{ auth.isAuthenticated ? 'Track Order' : 'Back to Home' }}
            </Button>
          </div>
        </div>
      </template>

      <!-- Not confirmed / failed state -->
      <template v-else-if="status === 'failed' || status === 'pending'">
        <div class="flex flex-col items-center gap-3 text-center">
          <span class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-error/10 border border-error/20">
            <Icon name="close" :size="30" class="text-error" />
          </span>

          <h1 ref="headingRef" tabIndex="-1" class="text-h1 font-display font-bold text-charcoal">
            Payment not confirmed
          </h1>
          <p class="mt-1 text-body text-muted">
            {{
              status === 'pending'
                ? "We're still confirming your payment with Paystack."
                : verifyError || "We couldn't confirm your payment. Your card was not charged."
            }}
          </p>

          <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center w-full">
            <Button to="/checkout" size="lg" class="w-full sm:w-auto" icon="creditCard">
              Try again
            </Button>
            <Button to="/contact" size="lg" variant="ghost" class="w-full sm:w-auto">
              Contact support
            </Button>
          </div>
          <p class="mt-4 text-body-sm text-muted">
            Your cart is still saved — you can pay again from checkout.
          </p>
        </div>
      </template>

      <!-- Invalid / missing reference -->
      <template v-else>
        <div class="flex flex-col items-center gap-3 text-center">
          <span class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-line/50">
            <Icon name="info" :size="30" class="text-muted" />
          </span>

          <h1 ref="headingRef" tabIndex="-1" class="text-h1 font-display font-bold text-charcoal">
            We couldn’t find that order
          </h1>
          <p class="mt-1 text-body text-muted">
            No payment reference was supplied. Head back to the menu and place a new order.
          </p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center w-full">
            <Button to="/shop" size="lg" class="w-full sm:w-auto">
              Browse the menu
            </Button>
            <Button to="/" size="lg" variant="ghost" class="w-full sm:w-auto">
              Back to home
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Subtle ring pulse for the success check icon. */
@keyframes savorbite-ring-pulse {
  0% { box-shadow: 0 0 0 0 rgba(47, 125, 79, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(47, 125, 79, 0); }
  100% { box-shadow: 0 0 0 0 rgba(47, 125, 79, 0); }
}
.ring-4.ring-success\/5 {
  animation: savorbite-ring-pulse 2s ease-in-out infinite;
}
</style>
