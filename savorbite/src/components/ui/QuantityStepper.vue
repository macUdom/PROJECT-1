<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  name: { type: String, default: 'quantity' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) },
})
const emit = defineEmits(['update:modelValue'])

const btn = computed(() =>
  props.size === 'sm'
    ? 'h-9 w-9'
    : 'h-11 w-11'
)

function update(next) {
  const clamped = Math.min(Math.max(next, props.min), props.max)
  if (clamped !== props.modelValue) emit('update:modelValue', clamped)
}
</script>

<template>
  <div
    class="inline-flex items-center rounded-lg border border-line bg-surface p-1 shadow-sm"
    role="group"
    :aria-label="`${name} selector`"
  >
    <button
      type="button"
      :aria-label="`Decrease ${name}`"
      :disabled="modelValue <= min"
      class="flex items-center justify-center rounded-sm text-charcoal transition-colors hover:bg-sand active:bg-sand disabled:cursor-not-allowed disabled:text-muted/40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
      :class="btn"
      @click="update(modelValue - 1)"
    >
      <Icon name="minus" :size="16" />
    </button>
    <span
      class="min-w-[2.5rem] px-2 text-center text-body-sm font-bold tabular-nums text-charcoal"
      aria-live="polite"
    >{{ modelValue }}</span>
    <button
      type="button"
      :aria-label="`Increase ${name}`"
      :disabled="modelValue >= max"
      class="flex items-center justify-center rounded-sm text-charcoal transition-colors hover:bg-sand active:bg-sand disabled:cursor-not-allowed disabled:text-muted/40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
      :class="btn"
      @click="update(modelValue + 1)"
    >
      <Icon name="plus" :size="16" />
    </button>
  </div>
</template>
