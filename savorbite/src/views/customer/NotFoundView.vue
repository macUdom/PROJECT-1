<script setup>
import Button from '@/components/ui/Button.vue'
</script>

<template>
  <div class="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center md:px-6">
    <p class="text-h0 font-display font-bold tabular-nums text-sand">404</p>
    <h1 class="mt-2 text-h1 font-display font-bold text-charcoal">This page isn’t on the menu</h1>
    <p class="mt-3 text-body text-muted">
      The link may be old, or the dish was removed. Let’s get you back to something tasty.
    </p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <Button :to="{ name: 'home' }">Back to home</Button>
      <Button :to="{ name: 'shop' }" variant="secondary">Browse the menu</Button>
    </div>
  </div>
</template>
