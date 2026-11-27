<script setup>
import { computed, ref, useId } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  name: { type: String, default: '' },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  inputmode: { type: String, default: null },
  autocomplete: { type: String, default: null },
  min: { type: [String, Number], default: null },
  max: { type: [String, Number], default: null },
  prefix: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const autoId = useId()
const inputId = computed(() => props.id || `${props.name || 'field'}-${autoId}`)
const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const isNumeric = computed(() => props.type === 'number')
const effectiveType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))

function onInput(e) {
  const raw = e.target.value
  if (isNumeric.value) {
    if (raw === '') return emit('update:modelValue', '')
    const n = Number(raw)
    if (Number.isFinite(n)) return emit('update:modelValue', n)
  }
  emit('update:modelValue', raw)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-body-sm font-medium text-charcoal">
      {{ label }}
      <span v-if="required" class="text-error" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <span
        v-if="prefix"
        class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body-sm font-medium text-muted tabular-nums"
      >{{ prefix }}</span>
      <input
        :id="inputId"
        :type="effectiveType"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error || hint ? `${inputId}-desc` : undefined"
        :class="[
          'h-11 w-full rounded-lg border bg-surface text-body text-charcoal placeholder:text-muted/60',
          'transition-colors focus:outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/25',
          'disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted',
          error ? 'border-error focus:border-error focus:ring-error/25' : 'border-line',
          prefix ? 'pl-9' : 'pl-3.5',
          isPassword ? 'pr-11' : 'pr-3.5',
        ]"
        @input="onInput"
        @blur="emit('blur', $event)"
      />
      <button
        v-if="isPassword"
        type="button"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        class="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
        @click="showPassword = !showPassword"
      >
        <Icon :name="showPassword ? 'eyeOff' : 'eye'" :size="18" />
      </button>
    </div>
    <p
      v-if="error || hint"
      :id="`${inputId}-desc`"
      :class="['text-body-xs', error ? 'text-error' : 'text-muted']"
      :role="error ? 'alert' : undefined"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
