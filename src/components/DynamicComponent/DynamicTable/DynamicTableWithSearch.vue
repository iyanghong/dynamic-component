<template>
  <div>
    <n-card title="搜索条件" size="small">
      <DynamicForm 
        :filedSchema="searchFields.filter(f => f.showInSimple || showAdvanced)" 
        v-model="searchParams"
      />
      <div style="margin-top: 16px; text-align: right;">
        <n-button type="primary" @click="handleSearch">搜索</n-button>
        <n-button style="margin-left: 8px;" @click="handleReset">重置</n-button>
        <n-button text @click="toggleAdvancedSearch" style="margin-left: 16px;">
          {{ showAdvanced ? '收起' : '高级搜索' }}
        </n-button>
      </div>
    </n-card>
    
    <DynamicTable 
      :config="tableConfig"
      :columns="columns"
      :data="tableData"
      style="margin-top: 16px;"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { NCard, NButton } from 'naive-ui'
import DynamicForm from '@/components/DynamicComponent/DynamicForm/DynamicForm.vue'
import DynamicTable from './DynamicTable.vue'
import type { TableConfig, TableProps } from './types'
import type { FormField } from '@/components/DynamicComponent/DynamicForm/types'

const props = defineProps<{
  tableConfig: TableProps
  columns: TableConfig
  searchFields: FormField[] // 搜索字段配置
}>()

const searchParams = ref<Record<string, any>>({})
const tableData = ref<any[]>([])
const showAdvanced = ref(false)

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

// 搜索处理
const handleSearch = async () => {
  if (props.tableConfig.getPageApi) {
    try {
      const result = await props.tableConfig.getPageApi({
        ...searchParams.value,
        pageIndex: 1,
        pageSize: props.tableConfig.pageSize || 10
      })
      if (result.success && result.data) {
        tableData.value = result.data.records || []
      }
    } catch (error) {
      console.error('搜索失败', error)
    }
  }
}

// 重置搜索条件
const handleReset = () => {
  searchParams.value = {}
  handleSearch()
}

// 初始化时加载数据
watch(() => props.tableConfig, handleSearch, { immediate: true })
</script>
