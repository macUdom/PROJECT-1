import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from './toast'

const STORAGE_KEY = 'savorbite_cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))

  const subtotal = computed(() =>
    items.value.reduce((s, i) => s + i.price * i.quantity, 0)
  )

  // Delivery fee note: free standard delivery on orders over ₦5,000.
  const deliveryMethod = ref('standard') // 'standard' | 'express'
  const standardFee = computed(() => (items.value.length === 0 ? 0 : subtotal.value >= 5000 ? 0 : 500))
  const expressFee = computed(() => (items.value.length === 0 ? 0 : 1500))

  const deliveryFee = computed(() =>
    items.value.length === 0 ? 0 : deliveryMethod.value === 'express' ? expressFee.value : standardFee.value
  )

  const total = computed(() => subtotal.value + deliveryFee.value)

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: items.value, deliveryMethod: deliveryMethod.value })
      )
    } catch {
      /* storage unavailable — cart stays in memory */
    }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.items)) items.value = parsed.items
      if (parsed?.deliveryMethod === 'standard' || parsed?.deliveryMethod === 'express') {
        deliveryMethod.value = parsed.deliveryMethod
      }
    } catch {
      /* ignore corrupt storage */
    }
  }

  const toastStore = useToastStore()

  function addItem(product, quantity = 1) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock || 99)
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || '',
        quantity: Math.min(quantity, product.stock || 99),
      })
    }
    persist()
    toastStore.push({
      message: `Added ${product.name} to cart`,
      type: 'success',
      actionLabel: 'View cart',
      onAction: async () => {
        // Dynamic import avoids a static import cycle with the router.
        const { default: router } = await import('@/router')
        router.push('/cart')
      },
    })
  }

  function removeItem(id) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return
    const [removed] = items.value.splice(idx, 1)
    persist()
    toastStore.push({
      message: `Removed ${removed.name}`,
      type: 'info',
      actionLabel: 'Undo',
      onAction: () => {
        items.value.splice(Math.min(idx, items.value.length), 0, removed)
        persist()
      },
    })
  }

  function updateQuantity(id, quantity) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    item.quantity = quantity
    persist()
  }

  function setDeliveryMethod(method) {
    deliveryMethod.value = method === 'express' ? 'express' : 'standard'
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  return {
    items,
    count,
    subtotal,
    deliveryMethod,
    deliveryFee,
    total,
    addItem,
    removeItem,
    updateQuantity,
    setDeliveryMethod,
    clear,
    restore,
    persist,
  }
})
