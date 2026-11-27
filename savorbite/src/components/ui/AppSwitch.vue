<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  hideLabel: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !modelValue)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-label="label"
    :disabled="disabled"
    class="inline-flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-50"
    @click="toggle"
  >
    <span
      class="relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      :class="modelValue ? 'border-paprika bg-paprika' : 'border-line bg-sand'"
    >
      <span
        class="absolute top-0.5 h-[19px] w-[19px] rounded-full bg-white shadow-sm transition-transform duration-150"
        :class="modelValue ? 'translate-x-[22px]' : 'translate-x-0.5'"
      />
    </span>
    <span v-if="label && !hideLabel" class="text-body-sm font-medium text-charcoal">{{ label }}</span>
  </button>
</template>
