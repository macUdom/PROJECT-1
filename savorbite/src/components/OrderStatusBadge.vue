<script setup>
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps({
  status: { type: String, required: true },
  size: { type: String, default: 'sm', validator: (v) => ['sm', 'md'].includes(v) },
})

// Statuses always shown as icon + text so colour is never the only signal.
const map = {
  Pending: { tone: 'warning', icon: 'clock' },
  Paid: { tone: 'info', icon: 'check' },
  Preparing: { tone: 'warning', icon: 'fire' },
  'Out for delivery': { tone: 'info', icon: 'truck' },
  Delivered: { tone: 'success', icon: 'check' },
  Cancelled: { tone: 'error', icon: 'close' },
}

const meta = computed(() => map[props.status] ?? { tone: 'neutral', icon: 'info' })
</script>

<template>
  <Badge :tone="meta.tone" :icon="meta.icon">
    <span :class="size === 'md' ? 'text-body-sm' : ''">{{ status }}</span>
  </Badge>
</template>
