<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  name: { type: String, default: '' },
  id: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])

const autoId = useId()
const selectId = computed(() => props.id || `${props.name || 'select'}-${autoId}`)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="selectId" class="text-body-sm font-medium text-charcoal">
      {{ label }}
    </label>
    <select
      :id="selectId"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      class="h-11 w-full appearance-none rounded-lg border bg-surface pl-3.5 pr-9 text-body text-charcoal transition-colors focus:outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/25 disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted"
      :class="error ? 'border-error' : 'border-line'"
      style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%236B5B4D%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M4 6l4 4 4-4%22/></svg>'); background-repeat: no-repeat; background-position: right 0.75rem center;"
      @change="emit('update:modelValue', $event.target.value); emit('change', $event)"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error || hint" class="text-body-xs" :class="error ? 'text-error' : 'text-muted'">
      {{ error || hint }}
    </p>
  </div>
</template>
