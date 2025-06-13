<template>
  <n-data-table
    :columns="tableColumns"
    :data="tableData"
    :pagination="pagination"
    :loading="loading"
    :style="tableStyle"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NDataTable } from 'naive-ui'
import type { TableConfig } from './types'
import { initTableColumns } from './utils'

const props = defineProps<{
  columns: TableConfig
  data: any[]
  loading?: boolean
  pagination?: boolean | object
  width?: string | number
  height?: string | number
}>()

const tableColumns = computed(() => initTableColumns(props.columns))
const tableData = computed(() => props.data)

const tableStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  } else {
    style.width = '100%'
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})
</script>
