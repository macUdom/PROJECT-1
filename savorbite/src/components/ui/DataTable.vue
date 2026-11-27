<script setup>
import { ref, computed } from 'vue'
import Icon from './Icon.vue'
import Skeleton from './Skeleton.vue'
import EmptyState from './EmptyState.vue'
import Button from './Button.vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'No results found' },
  emptyMessage: { type: String, default: '' },
  caption: { type: String, default: '' },
})

const emit = defineEmits(['row-click'])

const sort = ref({ key: null, dir: 1 })

function sortedRows(rows) {
  if (!sort.value.key) return rows
  const { key, dir } = sort.value
  return [...rows].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
    return String(va ?? '').localeCompare(String(vb ?? '')) * dir
  })
}

function toggleSort(col) {
  if (!col.sortable) return
  sort.value = sort.value.key === col.key ? { key: col.key, dir: -sort.value.dir } : { key: col.key, dir: 1 }
}

const cellValue = (row, col) =>
  typeof col.value === 'function' ? col.value(row) : row[col.key]

const displayRows = computed(() => sortedRows(props.rows))
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
    <!-- Desktop / tablet: real table -->
    <table v-if="!loading && rows.length" class="hidden w-full border-collapse md:table">
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <thead>
        <tr class="border-b border-line bg-sand/60">
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :aria-sort="sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined"
            :class="[
              'px-4 py-3 text-left text-body-xs font-semibold uppercase tracking-wide text-muted',
              col.align === 'right' ? 'text-right' : '',
              col.sortable ? 'cursor-pointer select-none hover:text-charcoal' : '',
            ]"
            @click="toggleSort(col)"
          >
            <span class="inline-flex items-center gap-1">
              {{ col.label }}
              <Icon v-if="col.sortable" :name="sort.key === col.key && sort.dir === -1 ? 'chevronDown' : 'chevronRight'" :size="12" />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in displayRows"
          :key="row[rowKey] ?? i"
          class="border-b border-line-subtle last:border-b-0 hover:bg-cream/60"
          @click="emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="['px-4 py-3 text-body-sm text-charcoal align-middle', col.align === 'right' ? 'text-right tabular-nums' : '']"
          >
            <slot name="cell" :row="row" :col="col" :value="cellValue(row, col)">
              {{ cellValue(row, col) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Loading state -->
    <div v-if="loading" class="divide-y divide-line-subtle">
      <div v-for="n in 5" :key="n" class="flex items-center gap-4 px-4 py-4">
        <Skeleton variant="circle" />
        <Skeleton variant="line" class="flex-1" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !rows.length" class="p-6">
      <slot name="empty">
        <EmptyState :title="emptyTitle" :message="emptyMessage" />
      </slot>
    </div>

    <!-- Mobile: stacked label/value cards -->
    <div v-if="!loading && rows.length" class="divide-y divide-line-subtle md:hidden">
      <div
        v-for="(row, i) in rows"
        :key="`m-${row[rowKey] ?? i}`"
        class="px-4 py-4"
      >
        <slot name="card" :row="row">
          <dl class="flex flex-col gap-2">
            <div v-for="col in columns" :key="col.key" class="flex items-start justify-between gap-4">
              <dt class="text-body-xs font-semibold uppercase tracking-wide text-muted">{{ col.label }}</dt>
              <dd class="min-w-0 text-right text-body-sm text-charcoal">
                <slot name="cell" :row="row" :col="col" :value="cellValue(row, col)">
                  {{ cellValue(row, col) }}
                </slot>
              </dd>
            </div>
          </dl>
        </slot>
        <slot name="row-actions" :row="row" />
      </div>
    </div>
  </div>
</template>
