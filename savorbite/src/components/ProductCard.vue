<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { useCartStore } from '@/stores/cart'
import { availabilityOf } from '@/services/mockData'

const props = defineProps({
  product: { type: Object, required: true },
})

const cart = useCartStore()
const stock = computed(() => availabilityOf(props.product))

const stockLabels = {
  inStock: 'In stock',
  low: 'Low stock',
  soldOut: 'Sold out',
}
</script>

<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-all duration-150 hover:shadow-md"
    :class="stock === 'soldOut' ? 'opacity-95' : ''"
  >
    <RouterLink
      :to="{ name: 'product', params: { id: product.id } }"
      class="relative block aspect-[4/3] overflow-hidden bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-paprika"
      :aria-label="`View ${product.name}`"
    >
      <img
        :src="product.images[0]"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        width="800"
        height="600"
        class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        :class="stock === 'soldOut' ? 'grayscale' : ''"
      />
      <span
        v-if="product.featured && stock !== 'soldOut'"
        class="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-body-xs font-semibold text-warning backdrop-blur-sm"
      >
        <Icon name="fire" :size="12" />
        Chef’s pick
      </span>
    </RouterLink>

    <div class="flex flex-1 flex-col p-4">
      <div class="flex-1">
        <p class="text-body-xs font-medium uppercase tracking-wide text-muted">{{ product.categoryName }}</p>
        <h3 class="mt-1 font-display text-h2 font-semibold leading-snug text-charcoal">
          <RouterLink
            :to="{ name: 'product', params: { id: product.id } }"
            class="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream hover:underline"
          >
            {{ product.name }}
          </RouterLink>
        </h3>
        <p class="mt-1 line-clamp-2 text-body-sm text-muted">{{ product.description }}</p>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <p class="font-body text-body-lg font-bold tabular-nums text-charcoal">
          <span class="font-body font-bold">₦</span>{{ product.price.toLocaleString() }}
        </p>
        <Badge v-if="stock === 'soldOut'" tone="error" rounded="full">Sold out</Badge>
        <Badge v-else-if="stock === 'low'" tone="warning" icon="clock">Low stock</Badge>
        <Badge v-else tone="success">In stock</Badge>
      </div>

      <div class="mt-3 flex gap-2">
        <Button
          v-if="stock !== 'soldOut'"
          size="sm"
          class="flex-1"
          icon="cart"
          @click="cart.addItem(product)"
        >
          Add to cart
        </Button>
        <Button v-else size="sm" variant="secondary" class="flex-1" disabled>
          Sold out
        </Button>
        <Button size="sm" variant="ghost" :to="{ name: 'product', params: { id: product.id } }">
          Details
        </Button>
      </div>
    </div>
  </article>
</template>
