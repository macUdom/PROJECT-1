import { defineStore } from 'pinia'
import { ref } from 'vue'

let uid = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push({ message, type = 'success', actionLabel, onAction, timeout = 4500 }) {
    const id = ++uid
    toasts.value.push({ id, message, type, actionLabel, onAction })
    if (timeout > 0) {
      setTimeout(() => dismiss(id), timeout)
    }
    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    push,
    dismiss,
    success: (message, actionLabel, onAction) =>
      push({ message, type: 'success', actionLabel, onAction }),
    error: (message) => push({ message, type: 'error', timeout: 7000 }),
    info: (message) => push({ message, type: 'info' }),
  }
})
