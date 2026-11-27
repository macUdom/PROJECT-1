<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppSwitch from '@/components/ui/AppSwitch.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Icon from '@/components/ui/Icon.vue'
import { http } from '@/services/http'
import { useToastStore } from '@/stores/toast'
import { formatNaira } from '@/services/mockData'

const toast = useToastStore()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const search = ref('')
const categoryFilter = ref('all')
const stockFilter = ref('all')
const errorMsg = ref('')

const columns = [
  { key: 'image', label: 'Dish' },
  { key: 'categoryName', label: 'Category' },
  { key: 'price', label: 'Price', align: 'right', sortable: true },
  { key: 'stock', label: 'Stock', align: 'right', sortable: true },
  { key: 'available', label: 'Availability', sortable: true },
  { key: 'actions', label: '' },
]

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [pRes, cRes] = await Promise.all([http.get('/products'), http.get('/categories')])
    products.value = pRes.products || []
    categories.value = cRes.categories || []
  } catch (e) {
    errorMsg.value = e.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const categoryOptions = computed(() => [
  { value: 'all', label: 'All categories' },
  ...categories.value.map((c) => ({ value: c.id, label: c.name })),
])

const filtered = computed(() => {
  let list = products.value
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((p) => (p.name || '').toLowerCase().includes(q))
  if (categoryFilter.value !== 'all') list = list.filter((p) => p.categoryId === categoryFilter.value || p.category === categoryFilter.value)
  if (stockFilter.value === 'in') list = list.filter((p) => p.available !== false && p.stock > 5)
  if (stockFilter.value === 'low') list = list.filter((p) => p.stock >= 1 && p.stock <= 5)
  if (stockFilter.value === 'out') list = list.filter((p) => p.stock < 1 || p.available === false)
  return list
})

const form = reactive({
  name: '',
  categoryId: '',
  priceKobo: '',
  unit: '',
  description: '',
  stock: 0,
  available: true,
  featured: false,
  imageUrl: '',
})
const formOpen = ref(false)
const saving = ref(false)
const uploading = ref(false)
const editingId = ref(null)
const formErrors = reactive({})

function blankForm() {
  Object.assign(form, {
    name: '',
    categoryId: categories.value[0]?.id || '',
    priceKobo: '',
    unit: '',
    description: '',
    stock: 0,
    available: true,
    featured: false,
    imageUrl: '',
  })
  formErrors.name = ''
  formErrors.priceKobo = ''
}

function openCreate() {
  blankForm()
  editingId.value = null
  formOpen.value = true
}

function openEdit(product) {
  editingId.value = product.id
  Object.assign(form, {
    name: product.name || '',
    categoryId: product.categoryId || product.category || '',
    priceKobo: Math.round((product.price || 0) * 100),
    unit: product.unit || '',
    description: product.description || '',
    stock: product.stock || 0,
    available: product.available !== false,
    featured: product.featured || false,
    imageUrl: (product.images && product.images[0]) || product.imageUrl || '',
  })
  formOpen.value = true
}

function validateForm() {
  formErrors.name = form.name.trim().length >= 2 ? '' : 'Enter the dish name (at least 2 characters).'
  formErrors.priceKobo = Number(form.priceKobo) > 0 ? '' : 'Enter a price above 0.'
  return !formErrors.name && !formErrors.priceKobo
}

async function uploadImage(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('image', file)
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
    const res = await fetch(base.replace('/api', '') + '/api/uploads/product-image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('savorbite_auth_token') || ''}` },
      body: fd,
    })
    const data = await res.json()
    if (data.url) {
      form.imageUrl = data.url
      toast.success('Image uploaded')
    } else {
      throw new Error(data.error?.message || 'Upload failed')
    }
  } catch (err) {
    toast.error(err.message || 'Upload failed')
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

async function saveForm() {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      priceKobo: Number(form.priceKobo),
      unit: form.unit.trim(),
      stock: Number(form.stock) || 0,
      available: form.available && Number(form.stock) > 0,
      featured: form.featured,
      imageUrl: form.imageUrl,
    }
    if (editingId.value) {
      await http.put(`/products/${editingId.value}`, payload)
      toast.success('Product updated')
    } else {
      await http.post('/products', payload)
      toast.success('Product added')
    }
    formOpen.value = false
    await load()
  } catch (e) {
    toast.error(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

const deleteTarget = ref(null)
const deleting = ref(false)

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await http.delete(`/products/${deleteTarget.value.id}`)
    toast.info('Product deleted')
    deleteTarget.value = null
    await load()
  } catch (e) {
    toast.error(e.message || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}

async function toggleActive(product) {
  try {
    const next = !product.available
    await http.put(`/products/${product.id}`, { available: next })
    product.available = next
    toast.success(`${product.name} is now ${next ? 'available' : 'hidden'}.`)
  } catch (e) {
    toast.error(e.message || 'Failed')
  }
}
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-h1 font-display font-bold text-charcoal">Products</h1>
        <p class="mt-1 text-body text-muted">{{ products.length }} dishes on the menu. Toggle availability without editing.</p>
      </div>
      <Button icon="plus" @click="openCreate">Add product</Button>
    </header>

    <p v-if="errorMsg" role="alert" class="mt-4 rounded-lg border border-error/40 bg-error/10 p-3 text-body-sm text-error">{{ errorMsg }}</p>
    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative flex-1">
        <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"><Icon name="search" :size="17" /></span>
        <input
          v-model="search"
          type="search"
          placeholder="Search dishes by name…"
          aria-label="Search dishes"
          class="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-4 text-body-sm text-charcoal placeholder:text-muted/70 focus:border-paprika focus:outline-none focus:ring-2 focus:ring-paprika/25"
        />
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <AppSelect v-model="categoryFilter" :options="categoryOptions" name="category-filter" id="p-category-filter" class="sm:w-52" />
        <div class="flex rounded-lg border border-line bg-surface p-1" role="group" aria-label="Filter by stock">
          <button
            v-for="opt in [{ v: 'all', l: 'All' }, { v: 'in', l: 'In' }, { v: 'low', l: 'Low' }, { v: 'out', l: 'Out' }]"
            :key="opt.v"
            type="button"
            class="h-9 rounded-md px-3.5 text-body-xs font-semibold transition-colors"
            :class="stockFilter === opt.v ? 'bg-paprika text-white' : 'text-muted hover:text-charcoal'"
            :aria-pressed="stockFilter === opt.v"
            @click="stockFilter = opt.v"
          >
            {{ opt.l }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table / cards -->
    <div class="mt-5">
      <DataTable v-if="!loading" :columns="columns" :rows="filtered" row-key="id" caption="Product management table" empty-message="Try a different search or filter.">
        <template #cell="{ row, col }">
          <span v-if="col.key === 'image'" class="flex items-center gap-3">
            <img :src="(row.images && row.images[0]) || row.imageUrl" :alt="row.name" loading="lazy" width="44" height="44" class="h-11 w-11 rounded-lg object-cover" />
            <span class="min-w-0">
              <span class="block truncate text-body-sm font-medium text-charcoal">{{ row.name }}</span>
              <span class="block truncate text-body-xs text-muted">{{ row.unit }}</span>
            </span>
            </span>
            <span v-else-if="col.key === 'price'" class="font-semibold tabular-nums">{{ formatNaira(row.price) }}</span>
          <span v-else-if="col.key === 'stock'" class="tabular-nums">{{ row.stock }}</span>
          <span v-else-if="col.key === 'available'" class="flex items-center gap-2">
            <AppSwitch :model-value="row.available" :label="row.name" hide-label class="shrink-0" @update:model-value="toggleActive(row)" />
            <Badge v-if="!row.available" tone="neutral">Hidden</Badge>
            <Badge v-else :tone="stockMeta(row).tone">{{ stockMeta(row).label }}</Badge>
          </span>
          <span v-else-if="col.key === 'actions'" class="flex justify-end gap-1.5">
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sand hover:text-charcoal" :aria-label="`Edit ${row.name}`" @click="openEdit(row)">
              <Icon name="edit" :size="16" />
            </button>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-error/10 hover:text-error" :aria-label="`Delete ${row.name}`" @click="deleteTarget = row">
              <Icon name="trash" :size="16" />
            </button>
          </span>
          <span v-else>{{ row[col.key] }}</span>
        </template>
        <template #card="{ row }">
          <div class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <img :src="row.images[0]" :alt="row.name" loading="lazy" width="40" height="40" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div class="min-w-0">
                  <p class="truncate text-body-sm font-semibold text-charcoal">{{ row.name }}</p>
                  <p class="text-body-xs text-muted">{{ row.categoryName || (categories.find((c) => c.id === (row.categoryId||row.category))?.name || '') }}</p>
                </div>
              </div>
              <p class="shrink-0 text-body-sm font-bold tabular-nums text-charcoal">{{ formatNaira(row.price) }}</p>
            </div>
            <div class="flex items-center justify-between gap-2">
              <Badge v-if="!row.available" tone="neutral">Hidden</Badge>
              <Badge v-else :tone="stockMeta(row).tone">{{ stockMeta(row).label }} · {{ row.stock }}</Badge>
              <div class="flex items-center gap-1">
                <AppSwitch :model-value="row.available" :label="row.name" hide-label @update:model-value="toggleActive(row)" />
                <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sand hover:text-charcoal" :aria-label="`Edit ${row.name}`" @click="openEdit(row)">
                  <Icon name="edit" :size="16" />
                </button>
                <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-error/10 hover:text-error" :aria-label="`Delete ${row.name}`" @click="deleteTarget = row">
                  <Icon name="trash" :size="16" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
      <div v-else class="rounded-lg border border-line bg-surface p-4 shadow-sm">
        <div v-for="n in 6" :key="n" class="flex items-center gap-4 border-b border-line-subtle py-3.5 last:border-0">
          <Skeleton variant="circle" /><Skeleton variant="line" class="flex-1" /><Skeleton variant="line" class="w-20" />
        </div>
      </div>
    </div>

    <!-- Add / edit modal -->
    <Modal
      v-model="formOpen"
      :title="editingId ? 'Edit product' : 'Add product'"
      :description="editingId ? 'Changes go live on the menu immediately.' : 'Fill in the dish details and upload a photo.'"
      size="lg"
    >
      <form class="flex flex-col gap-4" novalidate @submit.prevent="saveForm">
        <div class="grid gap-4 sm:grid-cols-2">
          <AppInput id="f-name" label="Dish name" name="name" v-model="form.name" :error="formErrors.name" required placeholder="Smoky Party Jollof" />
          <AppSelect id="f-category" label="Category" name="category" v-model="form.category" :options="categories.map((c) => ({ value: c.id, label: c.name }))" />
          <AppInput id="f-price" label="Price (₦)" name="price" type="number" :min="0" inputmode="numeric" v-model="form.price" :error="formErrors.price" required prefix="₦" placeholder="3500" />
          <AppInput id="f-stock" label="Stock available" name="stock" type="number" :min="0" inputmode="numeric" v-model="form.stock" hint="Set 0 to mark as sold out." />
        </div>
        <AppInput id="f-unit" label="Portion / serving note" name="unit" v-model="form.unit" placeholder="Big plate, serves 2" />
        <AppTextarea id="f-description" label="Description" name="description" :rows="3" v-model="form.description" placeholder="What makes this dish special?" />
        <AppSwitch v-model="form.available" label="Available on the menu" />

        <!-- Images -->
        <div class="rounded-lg border border-line bg-cream p-4">
          <p class="text-body-sm font-medium text-charcoal">Photos</p>
          <p class="mt-0.5 text-body-xs text-muted">First photo is the cover. JPG, PNG or WebP, up to 5MB.</p>
          <div v-if="form.images.length" class="mt-3 flex flex-wrap gap-3">
            <div v-for="(image, i) in form.images" :key="i" class="relative h-24 w-24 overflow-hidden rounded-lg border border-line">
              <img :src="image.url" :alt="`Upload preview ${i + 1}`" class="h-full w-full object-cover" />
              <span v-if="i === 0" class="absolute bottom-0 left-0 right-0 bg-charcoal/70 py-0.5 text-center text-[10px] font-semibold text-white">COVER</span>
              <div v-if="image.status === 'uploading'" class="absolute inset-0 flex flex-col items-center justify-center bg-charcoal/60 text-white">
                <span class="text-body-xs font-bold tabular-nums">{{ image.progress }}%</span>
                <span class="mt-1 h-1 w-16 overflow-hidden rounded-full bg-white/30"><span class="block h-full bg-white" :style="{ width: image.progress + '%' }" /></span>
              </div>
              <button
                v-else
                type="button"
                class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal/70 text-white transition-colors hover:bg-error"
                :aria-label="`Remove photo ${i + 1}`"
                @click="removeImage(i)"
              >
                <Icon name="close" :size="13" />
              </button>
            </div>
          </div>
          <label class="mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface text-body-sm font-medium text-charcoal transition-colors hover:bg-sand focus-within:ring-2 focus-within:ring-paprika">
            <Icon name="upload" :size="16" />
            Upload photo
            <input type="file" accept="image/*" class="sr-only" @change="onFilePicked" />
          </label>
        </div>
      </form>

      <template #footer>
        <Button variant="ghost" @click="formOpen = false">Cancel</Button>
        <Button :loading="saving" @click="saveForm">{{ editingId ? 'Save changes' : 'Add product' }}</Button>
      </template>
    </Modal>

    <!-- Delete confirmation -->
    <Modal
      :model-value="!!deleteTarget"
      title="Delete this product?"
      size="sm"
      @update:model-value="deleteTarget = null"
    >
      <div v-if="deleteTarget" class="flex flex-col gap-4">
        <p class="text-body-sm text-muted">
          <strong class="text-charcoal">{{ deleteTarget.name }}</strong> will be removed from the menu. Customers
          can no longer order it. This cannot be undone.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" class="sm:w-auto" @click="deleteTarget = null">Keep product</Button>
          <Button variant="danger" :loading="deleting" @click="confirmDelete">{{ deleting ? 'Deleting…' : 'Delete product' }}</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
