<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import PaymentBadge from '@/components/PaymentBadge.vue'
import { http } from '@/services/http'
import { formatNaira } from '@/services/mockData'

const orders = ref([])
const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [oRes, pRes] = await Promise.all([http.get('/orders'), http.get('/products')])
    orders.value = oRes.orders || []
    products.value = pRes.products || []
  } catch {
    orders.value = []
    products.value = []
  }
  loading.value = false
})

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()

// Revenue counts PAID orders only — the server is the only source of truth.
const todayOrders = computed(() => orders.value.filter((o) => isToday(o.createdAt)))
const revenueToday = computed(() =>
  todayOrders.value.filter((o) => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0)
)
const pendingCount = computed(() =>
  orders.value.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length
)
const lowStock = computed(() =>
  products.value
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
)

const recentOrders = computed(() => orders.value.slice(0, 5))
const avgOrderValue = computed(() =>
  orders.value.length
    ? Math.round(orders.value.reduce((s, o) => s + o.total, 0) / orders.value.length)
    : 0
)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-h1 font-display font-bold text-charcoal">Overview</h1>
        <p class="mt-1 text-body text-muted">Kitchen at a glance · {{ new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
      </div>
      <Button :to="{ name: 'admin-products' }" icon="plus">Add product</Button>
    </header>

    <!-- Stat cards -->
    <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <template v-if="loading">
        <div v-for="n in 4" :key="n" class="rounded-lg border border-line bg-surface p-5">
          <Skeleton variant="line" class="w-1/2" />
          <Skeleton variant="text" class="mt-3 w-3/4" />
        </div>
      </template>
      <template v-else>
        <div class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <p class="text-body-sm text-muted">Orders today</p>
          <p class="mt-1 text-h1 font-bold tabular-nums text-charcoal">{{ todayOrders.length }}</p>
          <p class="mt-1 text-body-xs text-muted">{{ pendingCount }} still in progress</p>
        </div>
        <div class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <p class="text-body-sm text-muted">Revenue today (verified)</p>
          <p class="mt-1 text-h1 font-bold tabular-nums text-success">{{ formatNaira(revenueToday) }}</p>
          <p class="mt-1 text-body-xs text-muted">Paid orders only</p>
        </div>
        <div class="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <p class="text-body-sm text-muted">Avg. order value</p>
          <p class="mt-1 text-h1 font-bold tabular-nums text-charcoal">{{ formatNaira(avgOrderValue) }}</p>
          <p class="mt-1 text-body-xs text-muted">All time</p>
        </div>
        <div class="rounded-lg border p-5 shadow-sm" :class="lowStock.length ? 'border-warning/40 bg-warning/5' : 'border-line bg-surface'">
          <p class="text-body-sm text-muted">Low-stock alerts</p>
          <p class="mt-1 text-h1 font-bold tabular-nums" :class="lowStock.length ? 'text-warning' : 'text-charcoal'">{{ lowStock.length }}</p>
          <p class="mt-1 text-body-xs text-muted">Refill before prep ends</p>
        </div>
      </template>
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <!-- Recent orders -->
      <section aria-labelledby="recent-heading" class="rounded-lg border border-line bg-surface shadow-sm">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="recent-heading" class="text-h2 font-display font-semibold text-charcoal">Recent orders</h2>
          <RouterLink :to="{ name: 'admin-orders' }" class="text-body-sm font-medium text-paprika hover:underline">View all</RouterLink>
        </div>
        <ul v-if="loading" class="divide-y divide-line-subtle">
          <li v-for="n in 4" :key="n" class="flex items-center gap-4 px-5 py-4"><Skeleton variant="circle" /><Skeleton variant="line" class="flex-1" /></li>
        </ul>
        <ul v-else class="divide-y divide-line-subtle">
          <li v-for="order in recentOrders" :key="order.id" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div class="min-w-0">
              <p class="text-body-sm font-semibold tabular-nums text-charcoal">{{ order.reference || order.id }} · {{ order.customer?.name }}</p>
              <p class="mt-0.5 truncate text-body-xs text-muted">
                {{ (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0) }} items · {{ (order.address || '').split(',')[1]?.trim() || (order.address || '').split(',')[0] }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <OrderStatusBadge :status="order.status" />
              <PaymentBadge :status="order.paymentStatus" />
              <span class="text-body-sm font-semibold tabular-nums text-charcoal">{{ formatNaira(order.total) }}</span>
            </div>
          </li>
        </ul>
      </section>

      <!-- Low stock list -->
      <section aria-labelledby="lowstock-heading" class="rounded-lg border border-line bg-surface shadow-sm">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="lowstock-heading" class="text-h2 font-display font-semibold text-charcoal">Stock alerts</h2>
          <span v-if="lowStock.length" class="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-body-xs font-semibold text-warning">
            <Icon name="alert" :size="12" /> {{ lowStock.length }}
          </span>
        </div>
        <ul v-if="lowStock.length" class="divide-y divide-line-subtle">
          <li v-for="p in lowStock" :key="p.id" class="flex items-center gap-3 px-5 py-3.5">
            <img :src="(p.images && p.images[0]) || p.imageUrl" :alt="p.name" loading="lazy" width="40" height="40" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-body-sm font-medium text-charcoal">{{ p.name }}</span>
              <span class="text-body-xs text-muted">{{ p.available ? `${p.stock} left` : 'Unavailable' }}</span>
            </span>
            <RouterLink :to="{ name: 'admin-products' }" class="shrink-0 rounded-lg px-2 py-1 text-body-xs font-medium text-paprika hover:bg-sand">Restock</RouterLink>
          </li>
        </ul>
        <div v-else class="px-5 py-10 text-center text-body-sm text-muted">
          All stocked up. No alerts right now.
        </div>
      </section>
    </div>
  </div>
</template>
