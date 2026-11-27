<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'card',
    validator: (v) => ['card', 'line', 'text', 'image', 'circle'].includes(v),
  },
  w: { type: String, default: '100%' },
  h: { type: String, default: null },
  rounded: { type: String, default: 'lg' },
})

const preset = computed(() => {
  switch (props.variant) {
    case 'line':
      return { h: '12px' }
    case 'text':
      return { h: '28px' }
    case 'image':
      return { h: '176px' }
    case 'circle':
      return { h: '2.5rem', w: '2.5rem' }
    default:
      return { h: '220px' }
  }
})

const height = computed(() => props.h ?? preset.value.h)
const width = computed(() => props.w ?? preset.value.w ?? '100%')
</script>

<template>
  <div
    :class="[
      'animate-shimmer bg-gradient-to-r from-sand via-surface-container to-sand bg-[length:200%_100%]',
      rounded === 'full' ? 'rounded-full' : 'rounded-lg',
    ]"
    :style="{ width, height }"
    role="status"
    aria-label="Loading"
  />
</template>
