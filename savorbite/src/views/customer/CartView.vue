<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import OrderSummary from '@/components/OrderSummary.vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

const isEmpty = computed(() => cart.items.length === 0)

function removeItem(id) {
  cart.removeItem(id)
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
    <h1 class="text-h1 font-display font-bold text-charcoal">Your cart</h1>
    <p v-if="!isEmpty" class="mt-1 text-body text-muted">
      {{ cart.count }} item{{ cart.count === 1 ? '' : 's' }} · cooked fresh once your order is placed.
    </p>

    <!-- Empty cart -->
    <div v-if="isEmpty" class="mt-8">
      <EmptyState
        icon="cart"
        title="Your cart is empty"
        message="Nothing here yet. Add a plate of jollof or a box of puff-puff and it will show up right here."
      >
        <Button :to="{ name: 'shop' }" icon="arrowRight">Browse the menu</Button>
      </EmptyState>
    </div>

    <!-- Cart with items -->
    <div v-else class="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <ul class="flex flex-col gap-4">
        <li
          v-for="item in cart.items"
          :key="item.id"
          class="flex gap-4 rounded-lg border border-line bg-surface p-3 shadow-sm sm:p-4"
        >
          <RouterLink
            :to="{ name: 'product', params: { id: item.id } }"
            class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika sm:h-24 sm:w-24"
          >
            <img
              :src="item.image"
              :alt="item.name"
              loading="lazy"
              width="200"
              height="200"
              class="h-full w-full object-cover"
            />
          </RouterLink>

          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="truncate text-body font-semibold text-charcoal">
                  <RouterLink
                    :to="{ name: 'product', params: { id: item.id } }"
                    class="rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
                  >
                    {{ item.name }}
                  </RouterLink>
                </h2>
                <p class="mt-0.5 text-body-sm tabular-nums text-muted">₦{{ item.price.toLocaleString() }} each</p>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-error/10 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                :aria-label="`Remove ${item.name} from cart`"
                @click="removeItem(item.id)"
              >
                <Icon name="trash" :size="18" />
              </button>
            </div>

            <div class="mt-auto flex items-end justify-between gap-3 pt-3">
              <QuantityStepper
                :model-value="item.quantity"
                size="sm"
                :max="99"
                name="quantity"
                @update:model-value="(q) => cart.updateQuantity(item.id, q)"
              />
              <p class="text-body font-bold tabular-nums text-charcoal">
                ₦{{ (item.price * item.quantity).toLocaleString() }}
              </p>
            </div>
          </div>
        </li>
      </ul>

      <!-- Summary -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-24">
        <OrderSummary
          :items="cart.items"
          :subtotal="cart.subtotal"
          :delivery-fee="cart.deliveryFee"
          :total="cart.total"
          :delivery-method="cart.deliveryMethod"
        />
        <Button :to="{ name: 'checkout' }" size="lg" full icon="arrowRight">
          Checkout · ₦{{ cart.total.toLocaleString() }}
        </Button>
        <Button variant="ghost" full :to="{ name: 'shop' }">Continue shopping</Button>
      </div>
    </div>
  </div>
</template>
