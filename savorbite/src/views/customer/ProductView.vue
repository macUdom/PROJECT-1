<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'
import StickyCartBar from '@/components/StickyCartBar.vue'
import { useCartStore } from '@/stores/cart'
import { api } from '@/services/api'
import { availabilityOf } from '@/services/mockData'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = ref(null)
const related = ref([])
const loading = ref(true)
const notFound = ref(false)
const quantity = ref(1)
const activeImage = ref(0)

const stock = computed(() => (product.value ? availabilityOf(product.value) : 'inStock'))

const stockLabel = computed(() =>
  stock.value === 'inStock'
    ? `In stock (${product.value.stock} plates available today)`
    : stock.value === 'low'
      ? `Only ${product.value.stock} left — order soon`
      : 'Sold out for today'
)

onMounted(async () => {
  loading.value = true
  try {
    const [p, r] = await Promise.all([
      api.getProduct(route.params.id),
      api.getRelatedProducts(route.params.id),
    ])
    product.value = p
    related.value = r
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

function addToCart() {
  if (!product.value || stock.value === 'soldOut') return
  cart.addItem(product.value, quantity.value)
}

function buyNow() {
  if (!product.value || stock.value === 'soldOut') return
  cart.addItem(product.value, quantity.value)
  router.push({ name: 'checkout' })
}
</script>

<template>
  <div v-if="loading" class="mx-auto max-w-7xl px-4 py-8 md:px-6">
    <div class="grid gap-8 lg:grid-cols-2">
      <div>
        <Skeleton variant="image" class="aspect-[4/3]" />
        <div class="mt-3 flex gap-3">
          <Skeleton v-for="n in 3" :key="n" variant="image" class="h-16 w-16" />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <Skeleton variant="line" class="w-1/4" />
        <Skeleton variant="text" class="w-3/4" />
        <Skeleton variant="line" class="w-1/3" />
        <Skeleton v-for="n in 3" :key="n" variant="line" class="w-full" />
        <Skeleton variant="text" class="h-12 w-48" />
      </div>
    </div>
  </div>

  <div v-else-if="notFound" class="mx-auto max-w-3xl px-4 py-16 md:px-6">
    <EmptyState
      icon="package"
      title="This dish isn’t on the menu"
      message="It may have sold out or been removed. Browse today’s menu to see what’s cooking."
    >
      <Button :to="{ name: 'shop' }">Back to the menu</Button>
    </EmptyState>
  </div>

  <div v-else>
    <div class="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-6 md:pb-12">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="text-body-sm text-muted">
        <ol class="flex items-center gap-1.5">
          <li><RouterLink :to="{ name: 'shop' }" class="hover:text-charcoal hover:underline">Menu</RouterLink></li>
          <li aria-hidden="true">/</li>
          <li>
            <RouterLink :to="{ name: 'shop', query: { category: product.category } }" class="hover:text-charcoal hover:underline">
              {{ product.categoryName }}
            </RouterLink>
          </li>
          <li aria-hidden="true">/</li>
          <li class="font-medium text-charcoal">{{ product.name }}</li>
        </ol>
      </nav>

      <div class="mt-5 grid gap-8 lg:grid-cols-2">
        <!-- Gallery -->
        <div>
          <div class="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
            <div class="aspect-[4/3] bg-sand">
              <img
                :src="product.images[activeImage]"
                :alt="`${product.name} — photo ${activeImage + 1} of ${product.images.length}`"
                width="900"
                height="675"
                class="h-full w-full object-cover"
                fetchpriority="high"
              />
            </div>
          </div>
          <div v-if="product.images.length > 1" class="mt-3 flex gap-3">
            <button
              v-for="(img, i) in product.images"
              :key="img"
              type="button"
              class="h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-sand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              :class="i === activeImage ? 'border-paprika' : 'border-line hover:border-line-strong'"
              :aria-label="`Show photo ${i + 1}`"
              :aria-current="i === activeImage"
              @click="activeImage = i"
            >
              <img :src="img" :alt="`${product.name} thumbnail ${i + 1}`" loading="lazy" width="200" height="200" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="flex flex-col">
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{{ product.categoryName }}</Badge>
            <Badge v-if="stock === 'inStock'" tone="success">In stock</Badge>
            <Badge v-else-if="stock === 'low'" tone="warning" icon="clock">Low stock</Badge>
            <Badge v-else tone="error">Sold out</Badge>
            <Badge v-if="product.featured" tone="brand" icon="fire">Chef’s pick</Badge>
          </div>

          <h1 class="mt-3 font-display text-h1 font-bold leading-tight text-charcoal">{{ product.name }}</h1>
          <p class="mt-2 text-body-lg font-bold tabular-nums text-paprika">₦{{ product.price.toLocaleString() }}</p>
          <p class="mt-1 text-body-sm text-muted">{{ product.unit }}</p>

          <p class="mt-5 max-w-prose text-body text-muted">{{ product.description }}</p>

          <p class="mt-4 flex items-center gap-2 text-body-sm" :class="stock === 'soldOut' ? 'text-error' : 'text-muted'">
            <Icon :name="stock === 'inStock' ? 'check' : 'alert'" :size="16" />
            {{ stockLabel }}
          </p>

          <div v-if="stock !== 'soldOut'" class="mt-6 flex flex-wrap items-center gap-4">
            <span class="text-body-sm font-medium text-charcoal">Quantity</span>
            <QuantityStepper
              v-model="quantity"
              :min="1"
              :max="product.stock"
              name="portion"
            />
            <span class="text-body-sm tabular-nums text-muted">Total ₦{{ (product.price * quantity).toLocaleString() }}</span>
          </div>

          <div class="mt-6 hidden gap-3 md:flex">
            <Button size="lg" icon="cart" :disabled="stock === 'soldOut'" @click="addToCart">
              {{ stock === 'soldOut' ? 'Sold out for today' : 'Add to cart' }}
            </Button>
            <Button variant="secondary" size="lg" :disabled="stock === 'soldOut'" @click="buyNow">
              Buy now
            </Button>
          </div>
        </div>
      </div>

      <!-- Related items -->
      <section v-if="related.length" class="mt-14" aria-labelledby="related-heading">
        <h2 id="related-heading" class="text-h1 font-display font-bold text-charcoal">Goes well with this</h2>
        <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
      </section>
    </div>

    <!-- Mobile sticky add-to-cart bar -->
    <StickyCartBar
      class="md:hidden"
      :price="product.price"
      :quantity="quantity"
      :sold-out="stock === 'soldOut'"
      @add="addToCart"
    />
  </div>
</template>
