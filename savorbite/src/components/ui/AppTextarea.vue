<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  name: { type: String, default: '' },
  id: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue', 'blur'])

const autoId = useId()
const areaId = computed(() => props.id || `${props.name || 'textarea'}-${autoId}`)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="areaId" class="text-body-sm font-medium text-charcoal">
      {{ label }}
      <span v-if="required" class="text-error" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="areaId"
      :name="name"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :class="[
        'w-full resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-body text-charcoal placeholder:text-muted/60',
        'transition-colors focus:outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/25',
        'disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted',
        error ? 'border-error' : 'border-line',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <p v-if="error || hint" class="text-body-xs" :class="error ? 'text-error' : 'text-muted'" :role="error ? 'alert' : undefined">
      {{ error || hint }}
    </p>
  </div>
</template>
