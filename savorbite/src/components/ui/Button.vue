<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from './Icon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger', 'success'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
  icon: { type: String, default: null },
  type: { type: String, default: 'button' },
})

const variants = {
  primary:
    'bg-paprika text-white shadow-sm hover:bg-paprika-800 active:bg-paprika-800 disabled:bg-paprika/50',
  secondary:
    'bg-surface text-charcoal border border-line hover:bg-sand active:bg-sand',
  ghost: 'bg-transparent text-charcoal hover:bg-sand active:bg-sand',
  danger: 'bg-error text-white shadow-sm hover:brightness-90 active:brightness-90',
  success: 'bg-success text-white shadow-sm hover:brightness-90 active:brightness-90',
}

const sizes = {
  sm: 'h-10 px-3.5 text-body-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-body-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-body gap-2 rounded-lg',
}

const classes = computed(() => [
  'inline-flex items-center justify-center font-semibold transition-all duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
  'disabled:cursor-not-allowed disabled:shadow-none select-none tap-highlight-transparent',
  'active:scale-[0.98]',
  variants[props.variant],
  sizes[props.size],
  props.full ? 'w-full' : '',
])

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})
</script>

<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :to="to || undefined"
    :href="href || undefined"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="classes"
  >
    <span
      v-if="loading"
      class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <Icon v-else-if="icon" :name="icon" :size="size === 'lg' ? 22 : 18" />
    <slot />
  </component>
</template>
