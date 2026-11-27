<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'
import SavorBiteMark from '@/components/layout/SavorBiteMark.vue'

const auth = useAuthStore()
const router = useRouter()
const drawerOpen = ref(false)

const navItems = [
  { to: { name: 'admin-overview' }, label: 'Overview', icon: 'grid' },
  { to: { name: 'admin-products' }, label: 'Products', icon: 'package' },
  { to: { name: 'admin-categories' }, label: 'Categories', icon: 'flag' },
  { to: { name: 'admin-orders' }, label: 'Orders', icon: 'truck' },
]

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- Mobile top bar -->
    <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
        :aria-expanded="drawerOpen"
        aria-controls="admin-drawer"
        aria-label="Toggle admin menu"
        @click="drawerOpen = !drawerOpen"
      >
        <Icon :name="drawerOpen ? 'close' : 'menu'" :size="22" />
      </button>
      <SavorBiteMark class="h-8 w-8" />
      <span class="text-body font-bold text-charcoal">SavorBite Admin</span>
    </header>

    <!-- Sidebar (desktop) -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
      <div class="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <SavorBiteMark class="h-8 w-8" />
        <span class="text-body font-bold text-charcoal">SavorBite Admin</span>
      </div>
      <nav class="flex-1 p-3" aria-label="Admin sections">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
          :class="$route.name === item.to.name ? 'bg-paprika/10 text-paprika' : 'text-muted hover:bg-sand hover:text-charcoal'"
        >
          <Icon :name="item.icon" :size="19" />
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="border-t border-line p-3">
        <RouterLink
          :to="{ name: 'home' }"
          class="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-muted transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
        >
          <Icon name="eye" :size="19" />
          View storefront
        </RouterLink>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm font-medium text-error transition-colors hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          @click="logout"
        >
          <Icon name="logout" :size="19" />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Drawer (mobile) -->
    <div
      v-if="drawerOpen"
      id="admin-drawer"
      class="fixed inset-0 z-30 bg-charcoal/40 lg:hidden"
      @click.self="drawerOpen = false"
    >
      <div class="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-surface animate-fade-in">
        <div class="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <SavorBiteMark class="h-8 w-8" />
          <span class="text-body font-bold text-charcoal">Menu</span>
        </div>
        <nav class="flex-1 p-3" aria-label="Admin sections (mobile)">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-body font-medium transition-colors"
            :class="$route.name === item.to.name ? 'bg-paprika/10 text-paprika' : 'text-muted hover:bg-sand hover:text-charcoal'"
            @click="drawerOpen = false"
          >
            <Icon :name="item.icon" :size="19" />
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="border-t border-line p-3">
          <RouterLink
            :to="{ name: 'home' }"
            class="mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-body-sm font-medium text-muted transition-colors hover:bg-sand hover:text-charcoal"
            @click="drawerOpen = false"
          >
            <Icon name="eye" :size="19" />
            View storefront
          </RouterLink>
          <button type="button" class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-body font-medium text-error hover:bg-error/10" @click="logout">
            <Icon name="logout" :size="19" />
            Sign out
          </button>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div class="lg:pl-60">
      <main class="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 150ms ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
