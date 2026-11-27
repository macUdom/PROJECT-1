<script setup>
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps({
  status: { type: String, required: true }, // 'Pending' | 'Paid' | 'Failed' | 'Refunded'
  note: { type: String, default: '' },
})

// "Paid" can only ever arrive here after server-side verification of the
// payment reference — never from a client-side click.
const meta = computed(() => {
  switch (props.status) {
    case 'Paid':
      return { tone: 'success', icon: 'check', label: 'Paid (verified)' }
    case 'Failed':
      return { tone: 'error', icon: 'close', label: 'Payment failed' }
    case 'Refunded':
      return { tone: 'neutral', icon: 'info', label: 'Refunded' }
    default:
      return { tone: 'warning', icon: 'clock', label: 'Payment pending' }
  }
})
</script>

<template>
  <span class="inline-flex flex-col items-start gap-0.5">
    <Badge :tone="meta.tone" :icon="meta.icon">
      {{ meta.label }}
    </Badge>
    <span v-if="note" class="text-body-xs text-muted">{{ note }}</span>
  </span>
</template>
