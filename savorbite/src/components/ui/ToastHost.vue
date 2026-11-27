<script setup>
import Icon from './Icon.vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const icons = {
  success: 'check',
  error: 'close',
  info: 'info',
}

const toneClasses = {
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-error/40 bg-error/10 text-error',
  info: 'border-line bg-surface text-charcoal',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border bg-surface px-4 py-3 shadow-lg animate-slide-up',
            toneClasses[toast.type],
          ]"
          role="status"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            :class="{
              'bg-success text-white': toast.type === 'success',
              'bg-error text-white': toast.type === 'error',
              'bg-sand text-paprika': toast.type === 'info',
            }"
          >
            <Icon :name="icons[toast.type]" :size="15" />
          </span>
          <p class="flex-1 text-body-sm font-medium">{{ toast.message }}</p>
          <button
            v-if="toast.actionLabel"
            type="button"
            class="shrink-0 rounded-sm px-1.5 py-1 text-body-sm font-semibold text-paprika underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
            @click="toast.onAction?.(); toastStore.dismiss(toast.id)"
          >
            {{ toast.actionLabel }}
          </button>
          <button
            type="button"
            :aria-label="`Dismiss: ${toast.message}`"
            class="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
            @click="toastStore.dismiss(toast.id)"
          >
            <Icon name="close" :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 220ms ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
@media (prefers-reduced-motion: reduce) {
  :deep(.animate-slide-up) {
    animation: none !important;
  }
}
</style>
