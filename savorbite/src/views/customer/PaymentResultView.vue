<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/services/http'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const status = ref('loading')
const order = ref(null)
const attempts = ref(0)
const maxAttempts = 6

async function checkPayment() {
  try {
    const ref = route.query.ref || route.query.reference
    if (!ref) {
      status.value = 'failed'
      return
    }
    try {
      const res = await http.get(`/payments/verify/${ref}`)
      order.value = res.order
      if (res.order?.paymentStatus === 'Paid') {
        status.value = 'success'
        return
      }
    } catch (e) {
      // continue
    }
    attempts.value += 1
    if (attempts.value < maxAttempts) {
      setTimeout(checkPayment, 2000)
      status.value = 'confirming'
    } else {
      status.value = 'failed'
    }
  } catch (e) {
    status.value = 'failed'
  }
}

onMounted(() => {
  checkPayment()
})
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-14 md:px-6">
    <div class="rounded-lg border border-line bg-surface p-7 text-center shadow-sm">
      <template v-if="status === 'loading' || status === 'checking' || status === 'confirming'">
        <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand">
          <span class="h-6 w-6 animate-spin rounded-full border-2 border-paprika border-t-transparent" />
        </span>
        <h1 class="text-h1 font-display font-bold text-charcoal">Confirming your payment</h1>
        <p class="mt-2 text-body text-muted">We’re verifying with Paystack. This may take a few seconds.</p>
      </template>
      <template v-else-if="status === 'success'">
        <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="check" :size="30" />
        </span>
        <h1 class="text-h1 font-display font-bold text-charcoal">Payment successful</h1>
        <p class="mt-2 text-body text-muted">Your payment was completed successfully.</p>
        <div class="mt-7 flex flex-col gap-3">
          <Button :to="{ name: 'orders' }" size="lg" full>View My Orders</Button>
          <Button :to="{ name: 'shop' }" variant="ghost" full>Keep shopping</Button>
        </div>
      </template>
      <template v-else>
        <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
          <Icon name="close" :size="30" />
        </span>
        <h1 class="text-h1 font-display font-bold text-charcoal">Payment failed</h1>
        <p class="mt-2 text-body text-muted">Your payment was not completed or could not be verified.</p>
        <div class="mt-7 flex flex-col gap-3">
          <Button :to="{ name: 'cart' }" size="lg" full>Back to Cart</Button>
          <Button :to="{ name: 'shop' }" variant="ghost" full>Shop</Button>
        </div>
      </template>
    </div>
  </div>
</template>
