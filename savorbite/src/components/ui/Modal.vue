<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'
import Button from './Button.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v) },
  closeOnBackdrop: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const panel = ref(null)
let lastFocused = null

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      lastFocused = document.activeElement
      document.body.classList.add('overflow-hidden')
      await nextTick()
      panel.value?.focus()
    } else {
      document.body.classList.remove('overflow-hidden')
      lastFocused?.focus?.()
    }
  }
)

function onKeydown(e) {
  if (!props.modelValue) return
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
    return
  }
  // Simple focus trap
  if (e.key === 'Tab' && panel.value) {
    const focusables = panel.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

onBeforeUnmount(() => document.body.classList.remove('overflow-hidden'))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @keydown="onKeydown"
        @click.self="closeOnBackdrop && close()"
      >
        <div
          ref="panel"
          tabindex="-1"
          :class="[
            'max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-xl outline-none animate-scale-in sm:rounded-lg',
            sizes[size],
          ]"
        >
          <header
            v-if="title || description"
            class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur"
          >
            <div>
              <h2 class="text-h2 font-display font-semibold text-charcoal">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-body-sm text-muted">{{ description }}</p>
            </div>
            <button
              type="button"
              aria-label="Close dialog"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
              @click="close"
            >
              <Icon name="close" :size="20" />
            </button>
          </header>
          <div class="px-5 py-5">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  :deep(.animate-scale-in) {
    animation: none !important;
  }
}
</style>
