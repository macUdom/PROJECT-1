<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppInput from '@/components/ui/AppInput.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import SavorBiteMark from '@/components/layout/SavorBiteMark.vue'

const auth = useAuthStore()
const toast = useToastStore()
const route = useRoute()
const router = useRouter()

const tab = ref('login')
const login = reactive({ email: '', password: '' })
const register = reactive({ name: '', email: '', phone: '', password: '', confirm: '' })
const errors = reactive({ login: '', register: {} })
const submitting = ref(false)

// Demo accounts shown so the prototype can be explored without a backend.
const demoAccounts = [
  { role: 'Customer', email: 'demo@savorbite.ng', password: 'demo1234' },
  { role: 'Admin', email: 'admin@savorbite.ng', password: 'admin1234' },
]

const password = computed(() => (tab.value === 'login' ? login.password : register.password))

watch(tab, () => {
  errors.login = ''
  errors.register = {}
})

function fillDemo(account) {
  if (tab.value !== 'login') tab.value = 'login'
  login.email = account.email
  login.password = account.password
}

async function onSubmit() {
  errors.login = ''
  if (tab.value === 'login') {
    if (!login.email || !login.password) {
      errors.login = 'Enter both your email and password to continue.'
      return
    }
    submitting.value = true
    try {
      const user = await auth.login(login.email, login.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`)
      redirectAfterAuth(user)
    } catch (e) {
      errors.login = e.message
    } finally {
      submitting.value = false
    }
    return
  }

  // Register validation
  const fieldErrors = {}
  if (register.name.trim().length < 2) fieldErrors.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(register.email.trim()))
    fieldErrors.email = 'Enter a valid email like you@example.com.'
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(register.phone.replace(/\s/g, '')))
    fieldErrors.phone = 'Enter a valid Nigerian phone number, e.g. 0803 123 4567.'
  if (register.password.length < 6)
    fieldErrors.password = 'Use at least 6 characters — add a number to make it stronger.'
  if (register.confirm !== register.password)
    fieldErrors.confirm = 'Both passwords must match.'
  errors.register = fieldErrors
  if (Object.keys(fieldErrors).length) return

  submitting.value = true
  try {
    const user = await auth.register(register.name.trim(), register.email.trim(), register.password, register.phone.replace(/\s/g, ''))
    toast.success(`Welcome to SavorBite, ${user.name.split(' ')[0]}.`)
    redirectAfterAuth(user)
  } catch (e) {
    const msg = e.message || 'Registration failed. Please try again.'
    if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('duplicate')) {
      errors.register.email = msg
    } else {
      errors.register.email = msg
    }
  } finally {
    submitting.value = false
  }
}

function redirectAfterAuth(user) {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  if (redirect && redirect.startsWith('/')) {
    router.push(redirect)
    return
  }
  const loggedInUser = user || auth.user
  if (loggedInUser?.role === 'admin') {
    router.push({ name: 'admin-overview' })
    return
  }
  router.push({ name: 'shop' })
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-10 md:px-6">
    <div class="flex flex-col items-center text-center">
      <SavorBiteMark class="h-12 w-12" />
      <h1 class="mt-4 font-display text-h1 font-bold text-charcoal">
        {{ tab === 'login' ? 'Sign in to SavorBite' : 'Create your account' }}
      </h1>
      <p class="mt-2 text-body-sm text-muted">
        {{ tab === 'login'
          ? 'Sign in to see your orders and check out faster.'
          : 'One account for ordering, order tracking and faster checkout.' }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="mt-6 flex rounded-lg border border-line bg-surface p-1" role="tablist" aria-label="Sign in or register">
      <button
        v-for="t in ['login', 'register']"
        :key="t"
        type="button"
        role="tab"
        :aria-selected="tab === t"
        :class="['flex-1 rounded-md px-4 py-2.5 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika',
          tab === t ? 'bg-paprika text-white' : 'text-muted hover:text-charcoal']"
        @click="tab = t"
      >
        {{ t === 'login' ? 'Sign in' : 'Register' }}
      </button>
    </div>

    <form class="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-sm" @submit.prevent="onSubmit">
      <!-- Login fields -->
      <template v-if="tab === 'login'">
        <AppInput
          id="login-email"
          label="Email"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          v-model="login.email"
          required
        />
        <AppInput
          id="login-password"
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          placeholder="Your password"
          v-model="login.password"
          required
        />
        <div class="flex justify-end">
          <button
            type="button"
            class="rounded text-body-sm font-medium text-paprika underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
            @click="toast.info('Password reset is not wired up in this prototype. Email hello@savorbite.ng for help.')"
          >
            Forgot password?
          </button>
        </div>
        <p v-if="errors.login" role="alert" class="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-body-sm text-error">
          <Icon name="alert" :size="17" class="mt-0.5 shrink-0" />
          <span>{{ errors.login }}</span>
        </p>
      </template>

      <!-- Register fields -->
      <template v-else>
        <AppInput id="reg-name" label="Full name" name="name" autocomplete="name" placeholder="Chidi Nwosu" v-model="register.name" :error="errors.register.name" required />
        <AppInput id="reg-email" label="Email" name="email" type="email" autocomplete="email" placeholder="you@example.com" v-model="register.email" :error="errors.register.email" required />
        <AppInput id="reg-phone" label="Phone number" name="phone" inputmode="tel" autocomplete="tel" placeholder="0803 123 4567" v-model="register.phone" :error="errors.register.phone" hint="Used only for delivery calls." />
        <AppInput id="reg-password" label="Password" name="password" type="password" autocomplete="new-password" placeholder="At least 6 characters" v-model="register.password" :error="errors.register.password" required />
        <AppInput id="reg-confirm" label="Confirm password" name="confirm" type="password" autocomplete="new-password" placeholder="Repeat your password" v-model="register.confirm" :error="errors.register.confirm" required />
      </template>

      <Button type="submit" size="lg" full :loading="submitting" :disabled="submitting">
        {{ tab === 'login' ? 'Sign in' : 'Create account' }}
      </Button>

      <p class="text-center text-body-sm text-muted">
        {{ tab === 'login' ? "Don’t have an account?" : 'Already have an account?' }}
        <button
          type="button"
          class="rounded font-semibold text-paprika underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
          @click="tab = tab === 'login' ? 'register' : 'login'"
        >
          {{ tab === 'login' ? 'Register' : 'Sign in' }}
        </button>
      </p>
    </form>

    <!-- Demo credentials -->
    <div class="mt-6 rounded-lg border border-dashed border-line p-4">
      <p class="text-body-xs font-semibold uppercase tracking-wide text-muted">Demo accounts (prototype only)</p>
      <ul class="mt-2 flex flex-col gap-2">
        <li v-for="acc in demoAccounts" :key="acc.email">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-lg bg-cream px-3 py-2.5 text-left transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
            @click="fillDemo(acc)"
          >
            <span class="text-body-sm font-medium text-charcoal">{{ acc.role }}</span>
            <span class="text-body-xs tabular-nums text-muted">{{ acc.email }} · {{ acc.password }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
