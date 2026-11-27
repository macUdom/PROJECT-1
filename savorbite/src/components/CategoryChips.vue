<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: 'all' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="flex gap-2 overflow-x-auto scrollbar-none pb-1"
    role="group"
    aria-label="Filter by category"
  >
    <button
      type="button"
      class="inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      :class="modelValue === 'all' ? 'border-paprika bg-paprika text-white shadow-sm' : 'border-line bg-surface text-charcoal hover:border-line-strong'"
      :aria-pressed="modelValue === 'all'"
      @click="emit('update:modelValue', 'all')"
    >
      All
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      type="button"
      class="inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      :class="modelValue === cat.id ? 'border-paprika bg-paprika text-white shadow-sm' : 'border-line bg-surface text-charcoal hover:border-line-strong'"
      :aria-pressed="modelValue === cat.id"
      @click="emit('update:modelValue', cat.id)"
    >
      {{ cat.name }}
    </button>
  </div>
</template>
