<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { paymentProviders } from '@/services/payment'
import { http } from '@/services/http'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import { formatNaira } from '@/services/mockData'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({
  name: auth.user?.name || '',
  phone: auth.user?.phone || '',
  email: auth.user?.email || '',
  address: '',
  city: 'Lagos',
  notes: '',
})

const errors = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
})
const touched = reactive({
  name: false,
  phone: false,
  email: false,
  address: false,
})

const provider = ref('paystack')
const confirming = ref(false)
const formError = ref('')
const summaryOpen = ref(false)

const cityOptions = [
  { value: 'Lagos', label: 'Lagos (Lekki–Island–Mainland)' },
  { value: 'Ikeja', label: 'Ikeja / Gbagada axis' },
  { value: 'Ajah', label: 'Ajah / Sangotedo' },
  { value: 'Yaba', label: 'Yaba / Surulere' },
]

const phonePattern = /^(\+?234|0)[789][01]\d{8}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(field) {
  switch (field) {
    case 'name':
      errors.name = form.name.trim().length >= 2 ? '' : 'Enter your full name (at least 2 characters).'
      break
    case 'phone':
      errors.phone = phonePattern.test(form.phone.replace(/\s/g, ''))
        ? ''
        : 'Enter a valid Nigerian phone number, e.g. 0803 123 4567 — the rider needs it.'
      break
    case 'email':
      errors.email = emailPattern.test(form.email.trim())
        ? ''
        : 'Enter a valid email like you@example.com so we can send your receipt.'
      break
    case 'address':
      errors.address = form.address.trim().length >= 10
        ? ''
        : 'Add street and area, e.g. “14b Adeola Odeku Street, Victoria Island”.'
      break
  }
}

function onBlur(field) {
  touched[field] = true
  validateField(field)
}

const isValid = computed(
  () =>
    form.name.trim().length >= 2 &&
    phonePattern.test(form.phone.replace(/\s/g, '')) &&
    emailPattern.test(form.email.trim()) &&
    form.address.trim().length >= 10
)

const cartEmpty = computed(() => cart.items.length === 0)

onMounted(() => {
  if (!auth.isAuthenticated) {
    toast.error('Please sign in before checkout.')
    router.push({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  if (cartEmpty.value) {
    toast.error('Your cart is empty — add a dish before checking out.')
    router.push({ name: 'shop' })
  }
})

async function submitPayment() {
  formError.value = ''
  ;['name', 'phone', 'email', 'address'].forEach((f) => {
    touched[f] = true
    validateField(f)
  })
  if (!auth.isAuthenticated) {
    toast.error('Please sign in to complete checkout.')
    router.push({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  if (!isValid.value) {
    const firstBad = ['name', 'phone', 'email', 'address'].find((f) => errors[f])
    document.getElementById(`checkout-${firstBad}`)?.focus()
    document.getElementById(firstBad + '-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  confirming.value = true
  try {
    const payload = {
      items: cart.items.map((i) => ({ id: i.id, quantity: i.quantity })),
      deliveryMethod: cart.deliveryMethod,
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, ''),
      },
      address: `${form.address.trim()}, ${form.city}`,
      notes: form.notes.trim(),
    }
    const { order } = await http.post('/orders', payload)
    const initRes = await http.post('/payments/initialize', { orderId: order.id, provider: 'paystack' })
    const authUrl = initRes.authorizationUrl || initRes.authorization_url
    if (authUrl) {
      window.location.href = authUrl
      return
    }
    throw new Error('Payment initialization failed')
  } catch (e) {
    if (e.status === 401) {
      // Don't clear the session mid-flow; just ask the customer to sign in.
      router.push({ name: 'login', query: { redirect: '/checkout' } })
      return
    }
    formError.value = e.message || 'Could not place order. Please try again.'
    toast.error(formError.value)
  } finally {
    confirming.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
    <h1 class="text-h1 font-display font-bold text-charcoal">Checkout</h1>
    <p class="mt-1 text-body text-muted">Three quick steps. Your details are only used for this order.</p>

    <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <form class="flex flex-col gap-6" novalidate @submit.prevent="submitPayment">
        <section class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-paprika text-body-sm font-bold text-white">1</span>
            <h2 class="text-h2 font-display font-semibold text-charcoal">Contact</h2>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <AppInput
              id="checkout-name"
              label="Full name"
              name="name"
              autocomplete="name"
              placeholder="Chidi Nwosu"
              :model-value="form.name"
              :error="touched.name ? errors.name : ''"
              required
              @update:model-value="form.name = $event"
              @blur="onBlur('name')"
            />
            <AppInput
              id="checkout-phone"
              label="Phone number"
              name="phone"
              inputmode="tel"
              autocomplete="tel"
              placeholder="0803 123 4567"
              :model-value="form.phone"
              :error="touched.phone ? errors.phone : ''"
              required
              @update:model-value="form.phone = $event"
              @blur="onBlur('phone')"
            />
            <AppInput
              id="checkout-email"
              label="Email"
              name="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="you@example.com"
              :model-value="form.email"
              :error="touched.email ? errors.email : ''"
              hint="We send your receipt and order updates here."
              required
              @update:model-value="form.email = $event"
              @blur="onBlur('email')"
            />
          </div>
        </section>

        <section class="rounded-lg border border-line bg-surface p-5 shadow-sm" id="address-section">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-paprika text-body-sm font-bold text-white">2</span>
            <h2 class="text-h2 font-display font-semibold text-charcoal">Delivery details</h2>
          </div>
          <div class="mt-4 grid gap-4">
            <AppInput
              id="checkout-address"
              label="Delivery address"
              name="address"
              autocomplete="street-address"
              placeholder="House number and street, e.g. 14b Adeola Odeku Street"
              :model-value="form.address"
              :error="touched.address ? errors.address : ''"
              required
              @update:model-value="form.address = $event"
              @blur="onBlur('address')"
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <AppSelect
                id="checkout-city"
                label="Neighbourhood / area"
                name="city"
                :options="cityOptions"
                :model-value="form.city"
                @update:model-value="form.city = $event"
              />
              <AppInput
                id="checkout-notes"
                label="Delivery notes"
                name="notes"
                placeholder="Gate code, extra pepper, no onions…"
                hint="Optional"
                :model-value="form.notes"
                @update:model-value="form.notes = $event"
              />
            </div>

            <fieldset class="mt-1">
              <legend class="text-body-sm font-medium text-charcoal">Delivery speed</legend>
              <div class="mt-2 grid gap-3 sm:grid-cols-2">
                <label
                  for="delivery-standard"
                  class="flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors"
                  :class="cart.deliveryMethod === 'standard' ? 'border-paprika bg-paprika/5' : 'border-line hover:border-line-strong'"
                >
                  <input
                    id="delivery-standard"
                    type="radio"
                    name="delivery"
                    value="standard"
                    :checked="cart.deliveryMethod === 'standard'"
                    class="mt-0.5 h-4 w-4 text-paprika"
                    @change="cart.setDeliveryMethod('standard')"
                  />
                  <span class="flex flex-col">
                    <span class="text-body-sm font-semibold text-charcoal">Standard · 60–90 min</span>
                    <span class="text-body-xs text-muted">
                      {{ cart.subtotal >= 5000 ? 'Free on this order' : formatNaira(500) + ' — free over ' + formatNaira(5000) }}
                    </span>
                  </span>
                </label>
                <label
                  for="delivery-express"
                  class="flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors"
                  :class="cart.deliveryMethod === 'express' ? 'border-paprika bg-paprika/5' : 'border-line hover:border-line-strong'"
                >
                  <input
                    id="delivery-express"
                    type="radio"
                    name="delivery"
                    value="express"
                    :checked="cart.deliveryMethod === 'express'"
                    class="mt-0.5 h-4 w-4 text-paprika"
                    @change="cart.setDeliveryMethod('express')"
                  />
                  <span class="flex flex-col">
                    <span class="text-body-sm font-semibold text-charcoal">Express · 45–60 min</span>
                    <span class="text-body-xs text-muted">{{ formatNaira(1500) }} · priority rider</span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        </section>

        <section class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-paprika text-body-sm font-bold text-white">3</span>
            <h2 class="text-h2 font-display font-semibold text-charcoal">Payment</h2>
          </div>
          <fieldset class="mt-4">
            <legend class="text-body-sm font-medium text-charcoal">Pay with</legend>
            <div class="mt-2 grid gap-3 sm:grid-cols-2">
              <label
                v-for="p in paymentProviders"
                :key="p.id"
                :for="`provider-${p.id}`"
                class="flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors"
                :class="provider === p.id ? 'border-paprika bg-paprika/5' : 'border-line hover:border-line-strong'"
              >
                <input
                  :id="`provider-${p.id}`"
                  v-model="provider"
                  type="radio"
                  name="provider"
                  :value="p.id"
                  class="mt-0.5 h-4 w-4 text-paprika"
                />
                <span class="flex flex-col">
                  <span class="text-body-sm font-semibold text-charcoal">{{ p.name }}</span>
                  <span class="text-body-xs text-muted">{{ p.note }}</span>
                </span>
              </label>
            </div>
            <p class="mt-3 flex items-start gap-1.5 text-body-xs text-muted">
              <Icon name="alert" :size="14" class="mt-0.5 shrink-0" />
              Your order is only marked paid after SavorBite’s server verifies the payment.
            </p>
          </fieldset>

          <Button
            type="submit"
            size="lg"
            full
            class="mt-5"
            icon="creditCard"
            :loading="confirming"
            :disabled="confirming || cartEmpty"
          >
            {{ confirming ? 'Creating order…' : 'Place order & pay' }}
          </Button>
          <p v-if="formError" role="alert" class="mt-3 rounded-lg border border-error/40 bg-error/10 p-3 text-body-sm text-error">{{ formError }}</p>
        </section>
      </form>

      <aside class="lg:sticky lg:top-24">
        <div class="hidden lg:block">
          <OrderSummary
            :items="cart.items"
            :subtotal="cart.subtotal"
            :delivery-fee="cart.deliveryFee"
            :total="cart.total"
            :delivery-method="cart.deliveryMethod"
          />
          <Button variant="ghost" full class="mt-3" :to="{ name: 'cart' }">Edit cart</Button>
        </div>
        <div class="rounded-lg border border-line bg-surface shadow-sm lg:hidden">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 p-4 text-left"
            :aria-expanded="summaryOpen"
            @click="summaryOpen = !summaryOpen"
          >
            <span class="text-body-sm font-semibold text-charcoal">
              Order summary ({{ cart.count }} items) · <span class="tabular-nums">{{ formatNaira(cart.total) }}</span>
            </span>
            <Icon name="chevronDown" :size="18" class="shrink-0 text-muted" :class="summaryOpen ? 'rotate-180' : ''" />
          </button>
          <div v-if="summaryOpen" class="border-t border-line p-4">
            <OrderSummary
              :items="cart.items"
              :subtotal="cart.subtotal"
              :delivery-fee="cart.deliveryFee"
              :total="cart.total"
              :delivery-method="cart.deliveryMethod"
            />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
