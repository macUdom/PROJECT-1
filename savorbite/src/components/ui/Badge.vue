<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'success', 'warning', 'error', 'info', 'brand'].includes(v),
  },
  icon: { type: String, default: null },
  rounded: { type: String, default: 'full', validator: (v) => ['full', 'lg'].includes(v) },
})

// Each tone pairs colour with an icon and a text label so status is never
// conveyed by colour alone (WCAG 1.4.1).
const defaultIcons = {
  success: 'check',
  warning: 'alert',
  error: 'close',
  info: 'info',
  brand: 'star',
  neutral: null,
}

const tones = {
  neutral: 'bg-sand text-charcoal border-line',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  error: 'bg-error/10 text-error border-error/30',
  info: 'bg-[#E1EEF7] text-[#0B5A8A] border-[#B9D7EA]',
  brand: 'bg-paprika/10 text-paprika border-paprika/30',
}

const iconName = computed(() => props.icon ?? defaultIcons[props.tone])
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 border px-2.5 py-0.5 text-body-xs font-semibold',
      tones[tone],
      rounded === 'full' ? 'rounded-full' : 'rounded-lg',
    ]"
  >
    <Icon v-if="iconName" :name="iconName" :size="12" />
    <slot />
  </span>
</template>
