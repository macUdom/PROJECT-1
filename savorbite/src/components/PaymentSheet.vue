<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import { initializePayment, verifyPaymentOnServer } from '@/services/payment'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  provider: { type: Object, required: true },
  amount: { type: Number, required: true }, // in naira
  email: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'success', 'failed', 'cancelled'])

const step = ref('idle') // idle | initializing | verifying
const error = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      step.value = 'idle'
      error.value = ''
    }
  }
)

const busy = computed(() => step.value === 'initializing' || step.value === 'verifying')
const statusLine = computed(() => {
  if (step.value === 'initializing') return 'Contacting payment provider…'
  if (step.value === 'verifying') return 'Confirming payment with our server…'
  return ''
})

async function pay() {
  error.value = ''
  try {
    step.value = 'initializing'
    const { reference } = await initializePayment({
      provider: props.provider.id,
      amountKobo: props.amount * 100,
      email: props.email,
    })
    // In production the provider redirect/callback happens here; the browser
    // never decides success. The server verifies before we mark it paid.
    step.value = 'verifying'
    const result = await verifyPaymentOnServer(reference)
    if (result.status === 'success') {
      step.value = 'idle'
      emit('success', reference)
    } else {
      step.value = 'idle'
      error.value = 'The provider declined this payment. Try another card or method.'
      emit('failed')
    }
  } catch (e) {
    step.value = 'idle'
    error.value = e.message || 'Something went wrong while contacting the payment provider.'
    emit('failed')
  }
}

function cancel() {
  emit('cancelled')
  emit('update:modelValue', false)
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Complete your payment"
    :description="`Simulated ${provider.name} checkout — prototype only, no real charge.`"
    size="sm"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-4">
      <div class="rounded-lg border border-line bg-cream p-4 text-center">
        <p class="text-body-sm text-muted">Total to pay</p>
        <p class="mt-1 text-h0 font-bold tabular-nums text-charcoal">₦{{ amount.toLocaleString() }}</p>
        <p class="mt-1 text-body-xs text-muted">via {{ provider.name }} · {{ provider.note }}</p>
      </div>

      <div class="rounded-lg border border-line p-4">
        <div class="flex items-center justify-between">
          <label for="demo-card" class="text-body-sm font-medium text-charcoal">Card number</label>
          <Icon name="creditCard" :size="18" class="text-muted" />
        </div>
        <input
          id="demo-card"
          type="text"
          value="4084 0840 8408 4080"
          readonly
          aria-describedby="demo-card-hint"
          class="mt-1.5 h-11 w-full rounded-lg border border-line bg-sand px-3.5 font-mono text-body-sm text-muted"
        />
        <p id="demo-card-hint" class="mt-1.5 text-body-xs text-muted">
          Demo field. In production this is the provider’s secure inline form.
        </p>
      </div>

      <p v-if="error" role="alert" class="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-body-sm text-error">
        <Icon name="alert" :size="17" class="mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </p>

      <p v-if="statusLine" class="flex items-center justify-center gap-2 text-body-sm text-muted" aria-live="polite">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-paprika border-t-transparent" />
        {{ statusLine }}
      </p>

      <Button full size="lg" :loading="busy" :disabled="busy" @click="pay">
        Pay ₦{{ amount.toLocaleString() }}
      </Button>
      <Button full variant="ghost" size="sm" :disabled="busy" @click="cancel">Cancel payment</Button>

      <!-- Demo controls for the failure / cancellation states -->
      <div class="flex items-center justify-center gap-3 border-t border-line pt-3 text-body-xs text-muted">
        <span>Demo:</span>
        <button type="button" class="font-medium text-paprika underline-offset-2 hover:underline" @click="emit('failed'); emit('update:modelValue', false)">
          Simulate failure
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" class="font-medium text-paprika underline-offset-2 hover:underline" @click="cancel">
          Simulate cancel
        </button>
      </div>
    </div>
  </Modal>
</template>
