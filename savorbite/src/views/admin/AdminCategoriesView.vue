<script setup>
import { onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import Modal from '@/components/ui/Modal.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Icon from '@/components/ui/Icon.vue'
import { http } from '@/services/http'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const categories = ref([])
const products = ref([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    const [cRes, pRes] = await Promise.all([http.get('/categories'), http.get('/products')])
    categories.value = cRes.categories || []
    products.value = pRes.products || []
  } catch {
    categories.value = []
    products.value = []
  }
  loading.value = false
})

const countFor = (id) => products.value.filter((p) => p.categoryId === id || p.category === id).length

const formOpen = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({ name: '', blurb: '', imageUrl: '' })
const formError = ref('')

function openCreate() {
  editingId.value = null
  form.value = { name: '', blurb: '', imageUrl: '' }
  formError.value = ''
  formOpen.value = true
}

function openEdit(cat) {
  editingId.value = cat.id
  form.value = { name: cat.name || '', blurb: cat.blurb || '', imageUrl: cat.imageUrl || cat.image || '' }
  formError.value = ''
  formOpen.value = true
}

async function save() {
  if (form.value.name.trim().length < 2) {
    formError.value = 'Enter a category name (at least 2 characters).'
    return
  }
  saving.value = true
  try {
    const payload = { name: form.value.name.trim(), blurb: form.value.blurb.trim(), imageUrl: form.value.imageUrl }
    if (editingId.value) {
      await http.put(`/categories/${editingId.value}`, payload)
      toast.success('Category updated')
    } else {
      await http.post('/categories', payload)
      toast.success('Category added')
    }
    formOpen.value = false
    const res = await http.get('/categories')
    categories.value = res.categories || []
  } catch (e) {
    toast.error(e.message || 'Could not save category')
  } finally {
    saving.value = false
  }
}

const deleteTarget = ref(null)
const deleteError = ref('')

function requestDelete(cat) {
  const used = countFor(cat.id)
  if (used > 0) {
    deleteError.value = `${used} product${used === 1 ? '' : 's'} still sit under ${cat.name}. Move or delete them first.`
    return
  }
  deleteError.value = ''
  deleteTarget.value = cat
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await http.delete(`/categories/${deleteTarget.value.id}`)
    const name = deleteTarget.value.name
    categories.value = categories.value.filter((c) => c.id !== deleteTarget.value.id)
    deleteTarget.value = null
    toast.info(`Deleted ${name}`)
  } catch (e) {
    toast.error(e.message || 'Failed to delete')
  }
}
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-h1 font-display font-bold text-charcoal">Categories</h1>
        <p class="mt-1 text-body text-muted">Group the menu so customers can browse by mood — swallows, grills, chops.</p>
      </div>
      <Button icon="plus" @click="openCreate">Add category</Button>
    </header>

    <p v-if="deleteError" role="alert" class="mt-4 flex items-start gap-2 rounded-lg border border-error/40 bg-error/10 p-3.5 text-body-sm text-error">
      <Icon name="alert" :size="17" class="mt-0.5 shrink-0" />
      <span>{{ deleteError }}</span>
      <button type="button" class="ml-auto shrink-0 font-semibold underline" @click="deleteError = ''">Dismiss</button>
    </p>

    <div v-if="loading" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="rounded-lg border border-line bg-surface p-4">
        <Skeleton variant="image" class="aspect-[4/3]" />
        <Skeleton variant="text" class="mt-3 w-2/3" />
        <Skeleton variant="line" class="mt-2 w-1/2" />
      </div>
    </div>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="cat in categories"
        :key="cat.id"
        class="overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
      >
        <div class="relative aspect-[4/3] bg-sand">
          <img :src="cat.imageUrl || cat.image" :alt="`${cat.name} — featured photo`" loading="lazy" width="400" height="300" class="h-full w-full object-cover" />
          <span class="absolute right-2.5 top-2.5 rounded-full bg-charcoal/70 px-2.5 py-0.5 text-body-xs font-semibold tabular-nums text-white">
            {{ countFor(cat.id) }} dishes
          </span>
        </div>
        <div class="p-4">
          <h2 class="text-body font-semibold text-charcoal">{{ cat.name }}</h2>
          <p class="mt-1 line-clamp-2 text-body-sm text-muted">{{ cat.blurb }}</p>
          <div class="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" @click="openEdit(cat)">Edit</Button>
            <Button size="sm" variant="ghost" @click="requestDelete(cat)">Delete</Button>
          </div>
        </div>
      </article>
    </div>

    <!-- Add / edit modal -->
    <Modal
      v-model="formOpen"
      :title="editingId ? 'Edit category' : 'Add category'"
      size="sm"
      @update:model-value="formOpen = $event"
    >
      <form class="flex flex-col gap-4" novalidate @submit.prevent="save">
        <AppInput id="cat-name" label="Category name" name="name" v-model="form.name" :error="formError" required placeholder="Small Chops" />
        <AppInput id="cat-blurb" label="Short description" name="blurb" v-model="form.blurb" hint="Shown on the menu. Keep it under 60 characters." placeholder="Puff-puff, samosa, chin chin" />
      </form>
      <template #footer>
        <Button variant="ghost" @click="formOpen = false">Cancel</Button>
        <Button :loading="saving" @click="save">{{ editingId ? 'Save changes' : 'Add category' }}</Button>
      </template>
    </Modal>

    <!-- Delete confirmation -->
    <Modal v-model="deleteTarget" title="Delete this category?" size="sm">
      <div v-if="deleteTarget" class="flex flex-col gap-4">
        <p class="text-body-sm text-muted">
          <strong class="text-charcoal">{{ deleteTarget.name }}</strong> will be removed. Categories with dishes
          inside can’t be deleted.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" @click="deleteTarget = null">Keep it</Button>
          <Button variant="danger" @click="confirmDelete">Delete category</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
