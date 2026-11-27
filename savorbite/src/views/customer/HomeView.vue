<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import ProductCard from '@/components/ProductCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { api } from '@/services/api'
import { products as allProducts } from '@/services/mockData'

const featured = ref([])
const categories = ref([])
const loading = ref(true)

const steps = [
  {
    icon: 'grid',
    title: 'Pick your food',
    copy: 'Browse the day’s menu — everything is cooked to order, so nothing sits around.',
  },
  {
    icon: 'creditCard',
    title: 'Pay securely',
    copy: 'Pay with Paystack or Flutterwave. We only mark an order paid after the server confirms it.',
  },
  {
    icon: 'truck',
    title: 'Track your order',
    copy: 'Follow your food from our kitchen to your door, and message us if anything’s off.',
  },
]

const testimonials = [
  {
    quote:
      'Ordered jollof for 12 people on Saturday and it showed up hot, on time, with extra pepper on the side. My guests are still talking about it.',
    name: 'Ngozi E.',
    area: 'Yaba',
  },
  {
    quote:
      'The suya tastes like the roadside stand behind my office. The app is fast even on my small data — no stress checking out.',
    name: 'Tunde A.',
    area: 'Ikeja',
  },
]

onMounted(async () => {
  try {
    const [featuredRes, catsRes] = await Promise.all([
      api.getProducts(),
      api.getCategories(),
    ])
    featured.value = featuredRes.filter((p) => p.featured).slice(0, 4)
    categories.value = catsRes
  } catch {
    // Keep the page usable — the shop page shows the real error state.
  } finally {
    loading.value = false
  }
})

const todaySpecials = computed(() => allProducts.filter((p) => p.featured).length)
</script>

<template>
  <div>
    <!-- Promo banner — one clear CTA per view -->
    <section
      class="border-b border-line bg-cover bg-center"
      style="background-image: linear-gradient(to right, rgba(43,33,24,0.72), rgba(43,33,24,0.25)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=70')"
    >
      <div class="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-16 md:px-6 md:py-24">
        <Badge tone="brand" icon="clock">Kitchen open · {{ todaySpecials }} chef’s picks on the menu today</Badge>
        <h1 class="max-w-xl font-display text-h0 font-bold leading-tight text-white">
          Real Lagos cooking, delivered hot.
        </h1>
        <p class="max-w-md text-body-lg text-white/90">
          Smoky jollof, suya fresh off the coals and small chops for the weekend — cooked this morning and
          at your door within 90 minutes.
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <Button :to="{ name: 'shop' }" size="lg" icon="arrowRight">Order now</Button>
          <RouterLink
            :to="{ name: 'about' }"
            class="inline-flex h-12 items-center rounded-lg border border-white/60 px-6 text-body font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            Our story
          </RouterLink>
        </div>
        <p class="flex items-center gap-1.5 text-body-sm text-white/75">
          <Icon name="truck" :size="16" />
          Free standard delivery on orders over ₦5,000
        </p>
      </div>
    </section>

    <!-- Featured items -->
    <section class="mx-auto max-w-7xl px-4 py-12 md:px-6" aria-labelledby="featured-heading">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="featured-heading" class="font-display text-h1 font-bold text-charcoal">Chef’s picks this week</h2>
          <p class="mt-2 max-w-lg text-body text-muted">
            Small-batch favourites we cook most often — priced for one plate, enough for two hungry people.
          </p>
        </div>
        <Button variant="secondary" :to="{ name: 'shop' }">See the full menu</Button>
      </div>

      <div v-if="loading" class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
          <Skeleton variant="image" class="aspect-[4/3] rounded-none" />
          <div class="flex flex-col gap-3 p-4">
            <Skeleton variant="text" class="w-3/4" />
            <Skeleton variant="line" class="w-full" />
            <Skeleton variant="line" class="w-2/3" />
          </div>
        </div>
      </div>
      <div v-else class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ProductCard v-for="product in featured" :key="product.id" :product="product" />
      </div>
    </section>

    <!-- Category shortcuts -->
    <section class="border-y border-line bg-sand/40" aria-labelledby="categories-heading">
      <div class="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 id="categories-heading" class="font-display text-h1 font-bold text-charcoal">Shop by category</h2>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <RouterLink
            v-for="cat in categories"
            :key="cat.id"
            :to="{ name: 'shop', query: { category: cat.id } }"
            class="group overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paprika focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <div class="aspect-[4/3] overflow-hidden bg-sand">
              <img
                :src="cat.image"
                :alt="cat.name"
                loading="lazy"
                decoding="async"
                width="400"
                height="300"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="p-3">
              <p class="text-body-sm font-semibold text-charcoal group-hover:text-paprika">{{ cat.name }}</p>
              <p class="mt-0.5 line-clamp-1 text-body-xs text-muted">{{ cat.blurb }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="mx-auto max-w-7xl px-4 py-12 md:px-6" aria-labelledby="how-heading">
      <h2 id="how-heading" class="font-display text-h1 font-bold text-charcoal">How SavorBite works</h2>
      <ol class="mt-8 grid gap-6 md:grid-cols-3">
        <li
          v-for="(step, i) in steps"
          :key="step.title"
          class="relative rounded-lg border border-line bg-surface p-6 shadow-sm"
        >
          <span class="absolute right-5 top-5 font-display text-h0 font-bold text-sand">{{ i + 1 }}</span>
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-paprika/10 text-paprika">
            <Icon :name="step.icon" :size="24" />
          </span>
          <h3 class="mt-4 text-h2 font-display font-semibold text-charcoal">{{ step.title }}</h3>
          <p class="mt-2 text-body-sm text-muted">{{ step.copy }}</p>
        </li>
      </ol>
    </section>

    <!-- Testimonials (static) -->
    <section class="border-t border-line bg-sand/40" aria-labelledby="testimonials-heading">
      <div class="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 id="testimonials-heading" class="font-display text-h1 font-bold text-charcoal">What our customers say</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          <figure
            v-for="t in testimonials"
            :key="t.name"
            class="flex flex-col rounded-lg border border-line bg-surface p-6 shadow-sm"
          >
            <div class="flex gap-0.5 text-warning" aria-label="5 out of 5 stars">
              <Icon v-for="s in 5" :key="s" name="star" :size="16" />
            </div>
            <blockquote class="mt-4 flex-1 text-body text-charcoal">“{{ t.quote }}”</blockquote>
            <figcaption class="mt-4 text-body-sm text-muted">
              <span class="font-semibold text-charcoal">{{ t.name }}</span> · {{ t.area }}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  </div>
</template>
