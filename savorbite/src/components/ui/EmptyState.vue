<script setup>
import Icon from './Icon.vue'

defineProps({
  icon: { type: String, default: 'search' },
  title: { type: String, default: 'Nothing to show here yet' },
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
    <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-paprika">
      <Icon :name="icon" :size="26" />
    </span>
    <h3 class="font-display text-h2 font-semibold text-charcoal">{{ title }}</h3>
    <p v-if="message" class="mt-2 max-w-md text-body-sm text-muted">{{ message }}</p>
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
      <slot />
    </div>
  </div>
</template>
