<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import ProductCard from '@/components/ProductCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CategoryChips from '@/components/CategoryChips.vue'
import { api } from '@/services/api'
import { availabilityOf } from '@/services/mockData'

const route = useRoute()
const router = useRouter()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const loadError = ref(false)

const search = ref('')
const category = ref('all')
const sort = ref('featured')
const sortOpen = ref(false)

const sortOptions = [
  { value: 'featured', label: 'Featured first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A–Z' },
]

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const [p, c] = await Promise.all([
      api.getProducts({ category: category.value, search: search.value }),
      api.getCategories(),
    ])
    products.value = p
    categories.value = c
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (route.query.category) category.value = String(route.query.category)
  if (route.query.q) search.value = String(route.query.q)
  await load()
})

const visibleProducts = computed(() => {
  let list = products.value
  // Server already filters by category and search; apply client-side sort only
  const sorted = [...list]
  switch (sort.value) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
  }
  return sorted
})

const resultCount = computed(() => visibleProducts.value.length)
const hasFilters = computed(() => search.value.trim() !== '' || category.value !== 'all')

function clearFilters() {
  search.value = ''
  category.value = 'all'
  if (Object.keys(route.query).length) router.push({ name: 'shop' })
  load()
}

function onCategoryChange(value) {
  category.value = value
  router.replace({ name: 'shop', query: value === 'all' ? {} : { category: value } })
  load()
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:px-6">
    <!-- Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-h1 font-bold text-charcoal">Today’s menu</h1>
        <p class="mt-1 text-body text-muted">Everything is cooked fresh each morning. {{ products.length }} dishes on offer.</p>
      </div>
    </div>

    <!-- Controls: search, category chips, sort -->
    <div class="mt-6 flex flex-col gap-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="relative flex-1">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="search" :size="18" />
          </span>
          <input
            v-model="search"
            type="search"
            placeholder="Search dishes, e.g. jollof, suya, zobo"
            aria-label="Search dishes"
            class="h-12 w-full rounded-lg border border-line bg-surface pl-11 pr-4 text-body text-charcoal placeholder:text-muted/70 transition-colors focus:border-paprika focus:outline-none focus:ring-2 focus:ring-paprika/25"
            @input="load"
          />
        </div>
        <div class="relative lg:w-64">
          <label for="sort" class="sr-only">Sort dishes</label>
          <select
            id="sort"
            v-model="sort"
            class="h-12 w-full appearance-none rounded-lg border border-line bg-surface px-3.5 pr-9 text-body-sm text-charcoal transition-colors focus:border-paprika focus:outline-none focus:ring-2 focus:ring-paprika/25"
            style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%236B5B4D%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M4 6l4 4 4-4%22/></svg>'); background-repeat: no-repeat; background-position: right 0.75rem center;"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>
      <CategoryChips :categories="categories" :model-value="category" @update:model-value="onCategoryChange" />
    </div>

    <!-- Result line -->
    <p v-if="!loading" class="mt-5 text-body-sm text-muted" aria-live="polite">
      <template v-if="hasFilters">
        {{ resultCount }} result{{ resultCount === 1 ? '' : 's' }}
        <template v-if="search">for “{{ search }}”</template>
        <template v-if="category !== 'all'"> in {{ categories.find((c) => c.id === category)?.name || 'category' }}</template>
      </template>
      <template v-else>Showing everything on the menu</template>
    </p>

    <!-- States -->
    <div v-if="loading" class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="n in 8" :key="n" class="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
        <Skeleton variant="image" class="aspect-[4/3] rounded-none" />
        <div class="flex flex-col gap-3 p-4">
          <Skeleton variant="line" class="w-1/3" />
          <Skeleton variant="text" class="w-3/4" />
          <Skeleton variant="line" class="w-full" />
          <Skeleton variant="line" class="w-2/3" />
        </div>
      </div>
    </div>

    <div v-else-if="loadError" class="mt-6">
      <EmptyState
        icon="alert"
        title="We couldn’t load the menu"
        message="Something went wrong on our side. Please check your connection and try again."
      >
        <Button @click="load">Try again</Button>
      </EmptyState>
    </div>

    <div v-else-if="resultCount === 0" class="mt-6">
      <EmptyState
        icon="search"
        title="No dishes match your search"
        message="Try a different word or category. If you can’t find your favourite, ask us — we might be able to cook it."
      >
        <Button variant="secondary" @click="clearFilters">Clear filters</Button>
        <Button variant="ghost" :to="{ name: 'contact' }">Suggest a dish</Button>
      </EmptyState>
    </div>

    <!-- Product grid -->
    <div v-else class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard v-for="product in visibleProducts" :key="product.id" :product="product" />
    </div>
  </div>
</template>
