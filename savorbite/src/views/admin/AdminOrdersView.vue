<script setup>
import { computed, onMounted, ref } from 'vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Icon from '@/components/ui/Icon.vue'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import PaymentBadge from '@/components/PaymentBadge.vue'
import { http } from '@/services/http'
import { useToastStore } from '@/stores/toast'
import { formatNaira, orderStatuses } from '@/services/mockData'

const toast = useToastStore()

const orders = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const errorMsg = ref('')
const updatingId = ref(null)

const statusOptions = computed(() => [
  { value: 'all', label: 'All statuses' },
  ...orderStatuses.map((s) => ({ value: s, label: s })),
])

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

const NEXT = {
  Pending: ['Preparing', 'Cancelled'],
  Paid: ['Preparing', 'Cancelled'],
  Preparing: ['Out for delivery', 'Cancelled'],
  'Out for delivery': ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
}

const NEXT_UNPAID = {
  Pending: ['Cancelled'],
  Paid: ['Cancelled'],
  Preparing: ['Cancelled'],
  'Out for delivery': ['Cancelled'],
  Delivered: [],
  Cancelled: [],
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await http.get('/orders')
    orders.value = res.orders || []
  } catch (e) {
    errorMsg.value = e.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const filtered = computed(() => {
  let list = orders.value
  if (statusFilter.value !== 'all') list = list.filter((o) => o.status === statusFilter.value)
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (o) =>
        (o.reference || o.id).toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.phone || '').includes(q) ||
        (o.address || '').toLowerCase().includes(q)
    )
  }
  return list
})

async function changeStatus(order, status) {
  if (!status || status === order.status) return
  if (status !== 'Cancelled' && order.paymentStatus !== 'Paid') {
    errorMsg.value = "This order hasn't been paid yet."
    toast.error(errorMsg.value)
    return
  }
  updatingId.value = order.id
  errorMsg.value = ''
  try {
    const res = await http.patch(`/orders/${order.id}/status`, { status })
    const updated = res.order || {}
    order.status = updated.status || status
    if (updated.items) order.items = updated.items
    toast.success(`Order ${(order.reference || order.id)} is now "${status}".`)
  } catch (e) {
    errorMsg.value = e.message || 'Failed to update status'
    toast.error(errorMsg.value)
  } finally {
    updatingId.value = null
  }
}

const nextOptions = (order) => {
  if (order.paymentStatus !== 'Paid') {
    return (NEXT_UNPAID[order.status] || []).map((s) => ({ value: s, label: s }))
  }
  return (NEXT[order.status] || []).map((s) => ({ value: s, label: s }))
}
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-h1 font-display font-bold text-charcoal">Orders</h1>
        <p class="mt-1 text-body text-muted">{{ orders.length }} orders</p>
      </div>
    </header>

    <p v-if="errorMsg" role="alert" class="mt-4 rounded-lg border border-error/40 bg-error/10 p-3 text-body-sm text-error">
      {{ errorMsg }}
    </p>

    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative flex-1">
        <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          <Icon name="search" :size="17" />
        </span>
        <input
          v-model="search"
          type="search"
          placeholder="Search by order reference, customer name, phone or address…"
          aria-label="Search orders"
          class="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-4 text-body-sm text-charcoal placeholder:text-muted/70 focus:border-paprika focus:outline-none focus:ring-2 focus:ring-paprika/25"
        />
      </div>
      <AppSelect v-model="statusFilter" :options="statusOptions" name="status-filter" id="o-status-filter" class="lg:w-56" />
    </div>

    <div v-if="loading" class="mt-6 flex flex-col gap-4">
      <div v-for="n in 4" :key="n" class="rounded-lg border border-line bg-surface p-5 shadow-sm">
        <Skeleton variant="line" class="w-1/4" />
        <Skeleton variant="text" class="mt-2 w-1/3" />
        <Skeleton variant="line" class="mt-4 w-full" />
      </div>
    </div>

    <div v-else-if="filtered.length === 0" class="mt-8 rounded-lg border border-line bg-surface p-10 text-center shadow-sm">
      <p class="text-body font-medium text-charcoal">No orders found</p>
      <p class="mt-1 text-body-sm text-muted">Try adjusting your search or filter.</p>
    </div>

    <div v-else class="mt-6 flex flex-col gap-4">
      <article
        v-for="order in filtered"
        :key="order.id"
        class="rounded-lg border border-line bg-surface shadow-sm"
      >
        <header class="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p class="text-body font-semibold tabular-nums text-charcoal">{{ order.reference || order.id }}</p>
            <p class="mt-0.5 text-body-xs text-muted">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <OrderStatusBadge :status="order.status" />
            <PaymentBadge :status="order.paymentStatus" />
          </div>
        </header>

        <div class="grid gap-4 px-5 py-4 md:grid-cols-2">
          <section>
            <h2 class="text-body-sm font-semibold text-charcoal">Customer</h2>
            <p class="mt-1 text-body-sm text-charcoal">{{ order.customer?.name }}</p>
            <p class="text-body-sm text-muted">{{ order.customer?.phone }}</p>
            <p class="text-body-sm text-muted">{{ order.customer?.email }}</p>
            <p class="mt-2 text-body-sm text-charcoal">Address</p>
            <p class="text-body-sm text-muted">{{ order.address }}</p>
            <p v-if="order.notes" class="mt-2 text-body-xs text-muted">Note: {{ order.notes }}</p>
          </section>

          <section>
            <h2 class="text-body-sm font-semibold text-charcoal">Items</h2>
            <ul class="mt-2 divide-y divide-line-subtle">
              <li
                v-for="(item, idx) in order.items || []"
                :key="idx"
                class="flex items-center justify-between gap-3 py-2"
              >
                <span class="text-body-sm text-charcoal">{{ item.name }} × {{ item.quantity }}</span>
                <span class="text-body-sm tabular-nums text-muted">{{ formatNaira((item.price || 0) * (item.quantity || 0)) }}</span>
              </li>
            </ul>
            <div class="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span class="text-body-sm font-semibold text-charcoal">Total</span>
              <span class="text-body font-semibold tabular-nums text-charcoal">{{ formatNaira(order.total) }}</span>
            </div>
          </section>
        </div>

        <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p class="text-body-xs text-muted">
            {{ order.paymentProvider ? `Paid via ${order.paymentProvider}` : 'No payment provider' }}
            <span v-if="order.paymentReference"> · Ref: {{ order.paymentReference }}</span>
          </p>
          <div class="flex items-center gap-2">
            <AppSelect
              v-if="nextOptions(order).length > 0"
              :model-value="''"
              :options="[{ value: '', label: 'Update status…' }, ...nextOptions(order)]"
              name="order-status"
              class="w-44"
              @update:model-value="(val) => changeStatus(order, val)"
            />
            <Button v-if="nextOptions(order).length === 0" variant="ghost" size="sm" disabled>No further updates</Button>
            <span v-if="updatingId === order.id" class="text-body-xs text-muted">Updating…</span>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>
