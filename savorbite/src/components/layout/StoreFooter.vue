<script setup>
import { RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'

const hours = [
  { day: 'Monday – Friday', time: '9:00 AM – 9:00 PM' },
  { day: 'Saturday', time: '10:00 AM – 10:00 PM' },
  { day: 'Sunday', time: '12:00 PM – 8:00 PM' },
]
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
      <!-- Brand + contact -->
      <div class="md:col-span-2">
        <h2 class="font-display text-h1 font-bold text-charcoal">SavorBite</h2>
        <p class="mt-3 max-w-sm text-body-sm text-muted">
          A small Lagos kitchen cooking the food we grew up eating — smoky jollof, suya, small chops — and
          delivering it hot to your door.
        </p>
        <ul class="mt-5 space-y-2.5 text-body-sm text-muted">
          <li class="flex items-center gap-2.5">
            <Icon name="location" :size="17" class="text-paprika" />
            24 Toyin Street, Ikeja, Lagos, Nigeria
          </li>
          <li class="flex items-center gap-2.5">
            <Icon name="phone" :size="17" class="text-paprika" />
            <a href="tel:+2348012345678" class="hover:text-charcoal hover:underline">+234 801 234 5678</a>
          </li>
          <li class="flex items-center gap-2.5">
            <Icon name="mail" :size="17" class="text-paprika" />
            <a href="mailto:hello@savorbite.ng" class="hover:text-charcoal hover:underline">hello@savorbite.ng</a>
          </li>
        </ul>
        <p class="mt-4 text-body-xs text-muted">
          Payments secured by Paystack and Flutterwave. We never see your full card details.
        </p>
      </div>

      <!-- Links -->
      <div>
        <h3 class="text-body-sm font-semibold uppercase tracking-wide text-charcoal">Explore</h3>
        <ul class="mt-3 space-y-2 text-body-sm">
          <li><RouterLink :to="{ name: 'shop' }" class="text-muted hover:text-charcoal hover:underline">Shop the menu</RouterLink></li>
          <li><RouterLink :to="{ name: 'about' }" class="text-muted hover:text-charcoal hover:underline">About us</RouterLink></li>
          <li><RouterLink :to="{ name: 'contact' }" class="text-muted hover:text-charcoal hover:underline">Contact</RouterLink></li>
          <li><RouterLink :to="{ name: 'orders' }" class="text-muted hover:text-charcoal hover:underline">Track an order</RouterLink></li>
        </ul>
      </div>

      <!-- Hours -->
      <div>
        <h3 class="text-body-sm font-semibold uppercase tracking-wide text-charcoal">Opening hours</h3>
        <ul class="mt-3 space-y-2 text-body-sm">
          <li v-for="h in hours" :key="h.day" class="flex flex-col text-muted">
            <span class="font-medium text-charcoal">{{ h.day }}</span>
            <span class="tabular-nums">{{ h.time }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-line">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-body-xs text-muted sm:flex-row md:px-6">
        <p>© {{ new Date().getFullYear() }} SavorBite Foods. Prototype built with Vue 3 + Tailwind CSS.</p>
        <p>Made with care in Lagos.</p>
      </div>
    </div>
  </footer>
</template>
