<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import StoreHeader from '@/components/layout/StoreHeader.vue'
import StoreFooter from '@/components/layout/StoreFooter.vue'
import ToastHost from '@/components/ui/ToastHost.vue'

const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()

// Restore persisted cart/auth state on first load.
onMounted(() => cart.restore())

const showChrome = computed(() => {
  // Admin pages render their own chrome; checkout/auth stay focused.
  if (route.meta.requiresAdmin) return { header: false, footer: false }
  const path = route.path
  return {
    header: path !== '/checkout',
    footer: path !== '/checkout' && path !== '/login',
  }
})

// Keep document title in sync even for hash-only navigations.
watch(
  () => route.meta.title,
  (title) => {
    if (title) document.title = title
  }
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream text-charcoal">
    <!-- While the session is being rehydrated, show a loading shell instead of
         rendering routes (avoids flashing a login redirect). -->
    <div v-if="auth.rehydrating" class="flex min-h-screen flex-col items-center justify-center bg-cream">
      <div class="flex flex-col items-center gap-2">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-paprika border-t-transparent" aria-hidden="true" />
        <p class="text-body-sm text-muted">Loading your session…</p>
      </div>
    </div>

    <div v-else>
      <StoreHeader v-if="showChrome.header" />
      <main class="flex-1">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
      <StoreFooter v-if="showChrome.footer" />
    </div>
    <ToastHost />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
