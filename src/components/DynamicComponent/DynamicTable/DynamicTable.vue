<template>
  <div>
    <!-- 表格操作区域 -->
    <div class="table-actions" style="margin-bottom: 16px;">

      <!-- 搜索表单区域 -->
      <div v-if="config.searchFields && config.searchFields.length > 0" class="search-area">
        <DynamicForm ref="searchFormRef" :filedSchema="visibleSearchFields" v-model:model="searchForm"
                     label-placement="left" :show-action="false"/>
        <n-space class="form-actions" align="center" justify="end">
          <n-button type="primary" @click="handleSearch">搜索</n-button>
          <n-button @click="handleReset">重置</n-button>
          <n-button v-if="hasAdvancedFields" text @click="toggleAdvanced">
            {{ showAdvanced ? '收起' : '展开' }}
          </n-button>
        </n-space>
      </div>

      <n-space style="margin-top: 15px">
        <!-- 新增按钮 -->
        <n-button v-if="config.createApi" type="primary" @click="openModal('create')" style="margin-right: 8px;">
          新增
        </n-button>
      </n-space>
    </div>

    <n-data-table :columns="tableColumns" :data="tableData" :pagination="pagination" :loading="loading"
                  :style="tableStyle"/>

    <FormPopup :form-prop="formProp" ref="formPopupRef" @on-sucess="handleFormSuccess"></FormPopup>
  </div>
</template>

<script lang="tsx" setup>
import { ref, computed, watch, h } from 'vue'
import { NDataTable, NButton, useMessage } from 'naive-ui'
import type { DataTableProps } from 'naive-ui'
import type { TableConfig, TableProps, TableAction, TableColumn } from './types'
import { initTableColumns } from './utils'
import DynamicForm from '@/components/DynamicComponent/DynamicForm/DynamicForm.vue'
import type { FormProps, FormField } from "@/components/DynamicComponent/DynamicForm/types.ts";

import type { CleverPopupProps } from "@/components/DynamicComponent/clever-popup/types.ts";
import FormPopup from '../DynamicForm/FormPopup.vue'

const props = defineProps<{
  config: TableProps
  columns: TableConfig
  data?: any[] // 改为可选，因为现在组件内部会自己获取数据
  loading?: boolean
  pagination?: DataTableProps['pagination']
  width?: string | number
  height?: string | number
  formProps?: CleverPopupProps
}>()


const currentRow = ref<any>(null)
const formPopupRef = ref<InstanceType<typeof FormPopup> | null>(null)

const formProp: FormProps = {
  filedSchema: props.config.formSchema || [],
  createApi: props.config.createApi,
  getApi: props.config.getApi,
  updateApi: props.config.updateApi
}



// 打开模态框
const openModal = (row?: any) => {
  currentRow.value = row ? {...row} : null
  formPopupRef.value?.open(row)
}

// 处理表单提交成功
const handleFormSuccess = () => {
  fetchData() // 重新加载数据
}

// 搜索相关变量
const searchFormRef = ref(null)
const searchForm = ref<Record<string, any>>({})
const showAdvanced = ref(false)

// 计算可见的搜索字段
const visibleSearchFields = computed<FormField[]>(() => {
  if (!props.config.searchFields) return []

  if (showAdvanced.value) {
    // 显示所有字段，包括隐藏字段
    return props.config.searchFields
  }

  // 只显示未隐藏的简单搜索字段
  return props.config.searchFields.filter(field =>
      field.showInSimple && !field.hidden
  )
})

// 检查是否有高级搜索字段
const hasAdvancedFields = computed(() => {
  if (!props.config.searchFields) return false
  return props.config.searchFields.some(field =>
      !field.showInSimple || field.hidden
  )
})

// 搜索处理
const handleSearch = () => {
  fetchData()
}

// 重置搜索表单
const handleReset = () => {
  searchForm.value = {}
  fetchData()
}

// 切换高级搜索
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const message = useMessage()
const loadingRef = ref(false)
const tableDataRef = ref<any[]>([])

// 获取数据
const fetchData = async () => {
  if (!props.config) return

  try {
    loadingRef.value = true

    // 合并搜索条件
    const searchParams = {...searchForm.value}

    if (props.config.pagination) {
      // 分页模式
      if (props.config.getPageApi) {
        const param = {
          pageIndex: 1,
          pageSize: props.config.pageSize || 10,
          ...searchParams
        }
        const result = await props.config.getPageApi(param)
        if (result.success && result.data) {
          // 双重断言确保类型兼容
          tableDataRef.value = (result.data.records as unknown as any[]) || []
          // 这里可以设置分页信息，简化处理
        }
      }
    } else {
      // 非分页模式
      if (props.config.getAllApi) {
        const result = await props.config.getAllApi(searchParams)
        if (result.success && result.data) {
          // 双重断言确保类型兼容
          tableDataRef.value = (result.data as unknown as any[]) || []
        }
      }
    }
  } catch (error) {
    if (props.config.onApiError) {
      props.config.onApiError(error, 'get')
    } else {
      message.error('数据加载失败')
    }
    console.error(error)
  } finally {
    loadingRef.value = false
  }
}

// 删除行
const handleDelete = async (row: any) => {
  if (!props.config?.deleteApi) return

  try {
    loadingRef.value = true
    const result = await props.config.deleteApi(row)
    if (result.success) {
      message.success('删除成功')
      fetchData() // 重新加载数据
    } else {
      message.error(result.message || '删除失败')
    }
  } catch (error) {
    message.error('删除操作失败')
    console.error(error)
  } finally {
    loadingRef.value = false
  }
}

// 生成操作列按钮
const generateActionButtons = (row: any, index: number) => {
  if (!props.config.actions) return []

  const actions: TableAction[] = []

  // 处理预定义操作（字符串数组）
  if (Array.isArray(props.config.actions) && props.config.actions.every(item => typeof item === 'string')) {
    (props.config.actions as string[]).forEach(action => {
      if (action === 'view') {
        actions.push({
          text: '详情',
          type: 'info',
          onClick: () => openModal(row)
        })
      } else if (action === 'edit' && props.config?.updateApi) {
        actions.push({
          text: '编辑',
          type: 'primary',
          onClick: () => openModal(row)
        })
      } else if (action === 'delete' && props.config?.deleteApi) {
        actions.push({
          text: '删除',
          type: 'error',
          onClick: () => handleDelete(row)
        })
      }
    })
  } 
  // 处理自定义操作（TableAction数组）
  else if (Array.isArray(props.config.actions) && props.config.actions.every(item => typeof item === 'object')) {
    (props.config.actions as TableAction[]).forEach(action => {
      if (typeof action.ifShow === 'function' ? action.ifShow(row, index) : action.ifShow ?? true) {
        actions.push(action)
      }
    })
  }

  return actions
}

// 初始化列
const initColumns = () => {
  return props.columns.map((col: TableColumn) => {
    // 如果是操作列且没有render函数，添加默认操作按钮
    if (col.key === 'actions' && !col.render) {
      return {
        ...col,
        render: (row: any, index: number) => {
          const actions = generateActionButtons(row, index)
          
          return actions.map((action, idx) =>
            h(NButton, {
              key: idx,
              type: action.type || 'default',
              size: 'small',
              onClick: () => action.onClick(row, index),
              style: { marginRight: '8px' }
            }, { default: () => action.text })
          )
        }
      }
    }
    return col
  })
}

const tableColumns = computed(() => initTableColumns(initColumns()))
const tableData = computed(() => props.data || tableDataRef.value)

// 监听config变化重新获取数据
watch(() => props.config, fetchData, {deep: true, immediate: true})

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
