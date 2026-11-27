<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Modal from '@/components/ui/Modal.vue'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import PaymentBadge from '@/components/PaymentBadge.vue'
import Icon from '@/components/ui/Icon.vue'
import { http } from '@/services/http'
import { useAuthStore } from '@/stores/auth'
import { formatNaira } from '@/services/mockData'

const auth = useAuthStore()
const orders = ref([])
const loading = ref(true)
const selected = ref(null)

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(async () => {
  try {
    const res = await http.get('/orders/mine')
    orders.value = (res.orders || []).map((o) => ({
      ...o,
      createdAt: o.createdAt,
      items: o.items || [],
    }))
  } catch {
    orders.value = []
  }
  loading.value = false
})

const hasOrders = computed(() => orders.value.length > 0)
const openOrders = computed(() => orders.value.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8 md:px-6">
    <h1 class="text-h1 font-display font-bold text-charcoal">My orders</h1>
    <p v-if="hasOrders" class="mt-1 text-body text-muted">
      {{ openOrders }} order{{ openOrders === 1 ? '' : 's' }} in progress · {{ orders.length }} total.
      Questions about an order? <RouterLink to="/contact" class="text-charcoal underline">Message us</RouterLink>.
    </p>

    <div v-if="loading" class="mt-6 flex flex-col gap-4">
      <div v-for="n in 3" :key="n" class="flex items-center gap-4 rounded-lg border border-line bg-surface p-4">
        <Skeleton variant="circle" />
        <div class="flex-1"><Skeleton variant="text" class="w-1/3" /><Skeleton variant="line" class="mt-2 w-1/2" /></div>
        <Skeleton variant="line" class="w-20" />
      </div>
    </div>

    <div v-else-if="!hasOrders" class="mt-8">
      <EmptyState
        icon="package"
        title="No orders yet"
        message="When you place your first order it will appear here so you can track it from kitchen to door."
      >
        <Button :to="{ name: 'shop' }" icon="arrowRight">Browse the menu</Button>
      </EmptyState>
    </div>

    <ul v-else class="mt-6 flex flex-col gap-4">
      <li
        v-for="order in orders"
        :key="order.id"
        class="rounded-lg border border-line bg-surface p-4 shadow-sm"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-body-sm font-semibold tabular-nums text-charcoal">{{ order.reference || order.id }}</p>
            <p class="mt-0.5 text-body-xs text-muted">{{ formatDate(order.createdAt) }} · {{ order.items.reduce((s, i) => s + i.quantity, 0) }} item(s)</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <OrderStatusBadge :status="order.status" />
            <PaymentBadge :status="order.paymentStatus" />
          </div>
        </div>
        <div class="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
          <p class="text-body-sm text-muted">
            <span v-for="(item, i) in order.items.slice(0, 3)" :key="item.id">
              {{ item.quantity }}× {{ item.name }}<span v-if="i < Math.min(order.items.length, 3) - 1">,</span>
            </span>
            <span v-if="order.items.length > 3"> +{{ order.items.length - 3 }} more</span>
          </p>
          <div class="flex items-center gap-3">
            <p class="text-body font-bold tabular-nums text-charcoal">{{ formatNaira(order.total) }}</p>
            <Button size="sm" variant="secondary" @click="selected = order">View details</Button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Order detail dialog -->
    <Modal
      :model-value="!!selected"
      title="Order details"
      size="md"
      @update:model-value="selected = null"
    >
      <div v-if="selected" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-body font-semibold tabular-nums text-charcoal">{{ selected.reference || selected.id }}</p>
          <div class="flex flex-wrap gap-2">
            <OrderStatusBadge :status="selected.status" size="md" />
            <PaymentBadge :status="selected.paymentStatus" />
          </div>
        </div>

        <div class="rounded-lg border border-line bg-cream p-4">
          <h3 class="text-body-sm font-semibold text-charcoal">Delivery</h3>
          <p class="mt-1 text-body-sm text-muted">{{ selected.address }}</p>
          <p v-if="selected.notes" class="mt-1 text-body-xs text-muted">Note: {{ selected.notes }}</p>
        </div>

        <div>
          <h3 class="text-body-sm font-semibold text-charcoal">Items</h3>
          <ul class="mt-2 divide-y divide-line-subtle">
            <li v-for="item in selected.items" :key="item.id" class="flex items-center justify-between gap-3 py-2.5">
              <span class="flex items-center gap-2 text-body-sm text-charcoal">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-sand text-body-xs font-bold tabular-nums">{{ item.quantity }}×</span>
                {{ item.name }}
              </span>
              <span class="text-body-sm tabular-nums text-muted">{{ formatNaira(item.price * item.quantity) }}</span>
            </li>
          </ul>
          <dl class="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-body-sm">
            <div class="flex justify-between"><dt class="text-muted">Delivery fee</dt><dd class="tabular-nums">{{ formatNaira(selected.deliveryFee) }}</dd></div>
            <div class="flex justify-between font-semibold"><dt>Total</dt><dd class="tabular-nums">{{ formatNaira(selected.total) }}</dd></div>
          </dl>
        </div>

        <p class="flex items-start gap-2 text-body-xs text-muted">
          <Icon name="alert" :size="15" class="mt-0.5 shrink-0" />
          <span>
            <template v-if="selected.paymentStatus === 'Paid'">Payment verified by our server.</template>
            <template v-else-if="selected.paymentStatus === 'Failed'">This payment failed — nothing was charged.</template>
            <template v-else>Awaiting payment confirmation.</template>
          </span>
        </p>

        <div class="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" @click="selected = null">Close</Button>
          <Button variant="secondary" :to="{ name: 'shop' }">Order something new</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
