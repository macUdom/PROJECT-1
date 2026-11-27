<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [Boolean, Array], default: false },
  label: { type: String, default: '' },
  name: { type: String, default: '' },
  id: { type: String, default: '' },
  value: { type: [String, Number], default: null },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const autoId = useId()
const cbId = computed(() => props.id || `cb-${props.name || autoId}`)

const checked = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.includes(props.value)
  return props.modelValue
})

function onChange() {
  if (Array.isArray(props.modelValue)) {
    const set = new Set(props.modelValue)
    if (set.has(props.value)) set.delete(props.value)
    else set.add(props.value)
    emit('update:modelValue', [...set])
  } else {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <div class="flex items-start gap-2.5">
    <input
      :id="cbId"
      type="checkbox"
      :name="name"
      :checked="checked"
      :disabled="disabled"
      class="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-line bg-surface text-paprika transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      @change="onChange"
    />
    <div class="flex flex-col">
      <label v-if="label" :for="cbId" class="cursor-pointer text-body-sm text-charcoal select-none">{{ label }}</label>
      <span v-if="hint" class="text-body-xs text-muted">{{ hint }}</span>
    </div>
  </div>
</template>
