<script setup>
import { computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import { formatNaira } from '@/services/mockData'

const props = defineProps({
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  deliveryMethod: { type: String, default: 'standard' },
})

const freeDelivery = computed(() => props.deliveryFee === 0)
const nextTier = computed(() => Math.max(0, 5000 - props.subtotal))
</script>

<template>
  <div class="rounded-lg border border-line bg-surface p-5 shadow-sm" aria-label="Order summary">
    <h2 class="text-h2 font-display font-semibold text-charcoal">Order summary</h2>

    <ul class="mt-4 flex flex-col gap-3 border-b border-line pb-4">
      <li v-for="item in items" :key="item.id" class="flex items-start justify-between gap-3">
        <span class="flex min-w-0 items-start gap-2 text-body-sm text-charcoal">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand text-body-xs font-bold tabular-nums text-charcoal">
            {{ item.quantity }}×
          </span>
          <span class="min-w-0 truncate">{{ item.name }}</span>
        </span>
        <span class="shrink-0 text-body-sm tabular-nums text-muted">{{ formatNaira(item.price * item.quantity) }}</span>
      </li>
    </ul>

    <dl class="mt-4 flex flex-col gap-2.5 border-b border-line pb-4 text-body-sm">
      <div class="flex justify-between">
        <dt class="text-muted">Subtotal</dt>
        <dd class="tabular-nums text-charcoal">{{ formatNaira(subtotal) }}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-muted">Delivery</dt>
        <dd class="tabular-nums" :class="freeDelivery ? 'text-success font-medium' : 'text-charcoal'">
          {{ freeDelivery ? 'Free' : formatNaira(deliveryFee) }}
        </dd>
      </div>
    </dl>

    <div class="mt-4 flex items-baseline justify-between">
      <span class="font-semibold text-charcoal">Total</span>
      <span class="text-h2 font-bold tabular-nums text-charcoal">{{ formatNaira(total) }}</span>
    </div>

    <p class="mt-3 flex items-start gap-1.5 text-body-xs text-muted">
      <Icon name="truck" :size="15" class="mt-0.5 shrink-0" />
      <span v-if="freeDelivery && deliveryMethod === 'standard'">
        Free standard delivery applied. Express delivery available at checkout.
      </span>
      <span v-else-if="deliveryMethod === 'express'">
        Express delivery — your food arrives in 45–90 minutes.
      </span>
      <span v-else>
        Standard delivery is free on orders over {{ formatNaira(5000) }} — add {{ formatNaira(nextTier) }} to qualify.
      </span>
    </p>
  </div>
</template>
