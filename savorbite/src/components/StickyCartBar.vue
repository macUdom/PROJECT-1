<script setup>
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps({
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  soldOut: { type: Boolean, default: false },
})
const emit = defineEmits(['add'])

const total = computed(() => props.price * props.quantity)
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-line bg-surface/95 px-4 py-3 shadow-lg backdrop-blur safe-pb"
  >
    <div class="min-w-0">
      <p class="text-body-xs text-muted">Total</p>
      <p class="text-h2 font-bold tabular-nums text-charcoal">₦{{ total.toLocaleString() }}</p>
    </div>
    <Button size="lg" icon="cart" :disabled="soldOut" class="shrink-0" @click="emit('add')">
      {{ soldOut ? 'Sold out' : 'Add to cart' }}
    </Button>
  </div>
</template>
