<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import SavorBiteMark from './SavorBiteMark.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

const mobileOpen = ref(false)
const accountOpen = ref(false)

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function closeMenus() {
  mobileOpen.value = false
  accountOpen.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape') closeMenus()
}

function onDocClick(e) {
  if (!e.target.closest('[data-account-menu]')) accountOpen.value = false
}

function logout() {
  auth.logout()
  closeMenus()
  if (router.currentRoute.value.meta.requiresAuth) router.push({ name: 'home' })
}

const cartCount = computed(() => cart.count)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
      <!-- Logo -->
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika">
        <SavorBiteMark class="h-9 w-9" />
        <span class="font-display text-h2 font-bold tracking-tight text-charcoal">SavorBite</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav aria-label="Main navigation" class="ml-6 hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-lg px-3.5 py-2 text-body-sm font-medium transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
          :class="($route.fullPath === link.to || ($route.path === '/' && link.to === '/')) ? 'bg-sand text-charcoal' : 'text-muted'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="flex-1"></div>

      <!-- Account -->
      <div class="relative hidden md:block" data-account-menu>
        <button
          type="button"
          class="flex h-11 items-center gap-2 rounded-lg px-3 text-body-sm font-medium text-muted transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
          :aria-expanded="accountOpen"
          aria-haspopup="menu"
          @click="accountOpen = !accountOpen"
        >
          <Icon name="user" :size="19" />
          <span>{{ auth.isAuthenticated ? auth.user.name.split(' ')[0] : 'Sign in' }}</span>
          <Icon name="chevronDown" :size="14" />
        </button>
        <div
          v-if="accountOpen"
          class="absolute right-0 mt-2 w-56 origin-top-right animate-scale-in rounded-lg border border-line bg-surface p-1.5 shadow-lg"
          role="menu"
        >
          <template v-if="auth.isAuthenticated">
            <p class="px-3 py-2 text-body-xs text-muted">{{ auth.user.email }}</p>
            <RouterLink
              v-if="auth.isAdmin"
              :to="{ name: 'admin-overview' }"
              class="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-body-sm font-medium text-charcoal transition-colors hover:bg-sand"
              role="menuitem"
              @click="closeMenus"
            >
              <Icon name="grid" :size="17" />
              Admin dashboard
            </RouterLink>
            <RouterLink
              :to="{ name: 'orders' }"
              class="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-body-sm font-medium text-charcoal transition-colors hover:bg-sand"
              role="menuitem"
              @click="closeMenus"
            >
              <Icon name="package" :size="17" />
              My orders
            </RouterLink>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-body-sm font-medium text-error transition-colors hover:bg-error/10"
              role="menuitem"
              @click="logout"
            >
              <Icon name="logout" :size="17" />
              Sign out
            </button>
          </template>
          <template v-else>
            <RouterLink
              :to="{ name: 'login' }"
              class="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-body-sm font-medium text-charcoal transition-colors hover:bg-sand"
              role="menuitem"
              @click="closeMenus"
            >
              <Icon name="user" :size="17" />
              Sign in / Register
            </RouterLink>
          </template>
        </div>
      </div>

      <!-- Cart -->
      <RouterLink
        :to="{ name: 'cart' }"
        class="relative flex h-11 w-11 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
        aria-label="Open cart"
      >
        <Icon name="cart" :size="21" />
        <span
          v-if="cartCount > 0"
          class="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-paprika px-1 text-[11px] font-bold tabular-nums text-white"
        >
          {{ cartCount > 99 ? '99+' : cartCount }}
        </span>
      </RouterLink>

      <!-- Mobile menu toggle -->
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika md:hidden"
        :aria-expanded="mobileOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <Icon :name="mobileOpen ? 'close' : 'menu'" :size="22" />
      </button>
    </div>

    <!-- Mobile nav -->
    <div v-if="mobileOpen" id="mobile-menu" class="animate-fade-in border-t border-line bg-surface px-4 pb-4 pt-2 md:hidden">
      <nav aria-label="Mobile navigation" class="flex flex-col">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center rounded-lg px-3 py-3 text-body font-medium text-charcoal transition-colors hover:bg-sand"
          @click="closeMenus"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="mt-2 border-t border-line pt-3">
        <template v-if="auth.isAuthenticated">
          <p class="px-3 pb-1 text-body-xs text-muted">Signed in as {{ auth.user.email }}</p>
          <RouterLink
            :to="{ name: 'orders' }"
            class="flex items-center rounded-lg px-3 py-3 text-body font-medium text-charcoal transition-colors hover:bg-sand"
            @click="closeMenus"
          >
            My orders
          </RouterLink>
          <RouterLink
            v-if="auth.isAdmin"
            :to="{ name: 'admin-overview' }"
            class="flex items-center rounded-lg px-3 py-3 text-body font-medium text-charcoal transition-colors hover:bg-sand"
            @click="closeMenus"
          >
            Admin dashboard
          </RouterLink>
          <Button variant="secondary" size="sm" full class="mt-2" @click="logout">Sign out</Button>
        </template>
        <RouterLink v-else :to="{ name: 'login' }" class="block" @click="closeMenus">
          <Button variant="primary" full>Sign in / Register</Button>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
