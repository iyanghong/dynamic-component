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

    <CleverPopup v-model:visible="modalVisible" :title="modalTitle">
      <DynamicForm
          v-if="modalVisible" v-bind="formProp" ref="formRef" @success="handleFormSuccess"
          @cancel="handleCancel"></DynamicForm>
    </CleverPopup>

  </div>
</template>

<script lang="tsx" setup>
import {ref, computed, watch, h} from 'vue'
import {NDataTable, NButton, useMessage} from 'naive-ui'
import type {DataTableProps} from 'naive-ui'
import type {TableConfig, TableProps, TableButton} from './types'
import {initTableColumns} from './utils'
import DynamicForm from '@/components/DynamicComponent/DynamicForm/DynamicForm.vue'
import type {ServiceResult} from '@/types/response-utils.ts'
import type {FormProps} from "@/components/DynamicComponent/DynamicForm/types.ts";
import CleverPopup from '../clever-popup/index.vue'
import type {CleverPopupProps} from "@/components/DynamicComponent/clever-popup/types.ts";


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

// 表单模态框相关
const modalVisible = ref(false)
const currentRow = ref<any>(null)
const formRef = ref<InstanceType<typeof DynamicForm> | null>(null)
const modalMode = ref<'create' | 'edit' | 'view'>('create')

const formProp: FormProps = {
  filedSchema: props.config.formSchema || [],
  createApi: props.config.createApi,
  getApi: props.config.getApi,
  updateApi: props.config.updateApi
}

const modalTitle = computed(() => {
  switch (modalMode.value) {
    case 'create':
      return '新增'
    case 'edit':
      return '编辑'
    case 'view':
      return '详情'
    default:
      return '表单'
  }
})


// 打开模态框
const openModal = (mode: 'create' | 'edit' | 'view', row?: any) => {
  modalMode.value = mode
  currentRow.value = row ? {...row} : null
  modalVisible.value = true
}

// 处理表单提交成功
const handleFormSuccess = (data: any) => {
  message.success(modalMode.value === 'create' ? '新增成功' : '编辑成功')
  modalVisible.value = false
  fetchData() // 重新加载数据
}

const handleCancel = () => {
  modalVisible.value = false
}


// 搜索相关变量
const searchFormRef = ref(null)
const searchForm = ref({})
const showAdvanced = ref(false)

// 计算可见的搜索字段
const visibleSearchFields = computed(() => {
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
          tableDataRef.value = result.data.records || []
          // 这里可以设置分页信息，简化处理
        }
      }
    } else {
      // 非分页模式
      if (props.config.getAllApi) {
        const result = await props.config.getAllApi(searchParams)
        if (result.success && result.data) {
          tableDataRef.value = result.data
        }
      }
    }
  } catch (error) {
    message.error('数据加载失败')
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

// 初始化列
const initColumns = () => {
  return props.columns.map(col => {
    // 如果是操作列且没有render函数，添加默认操作按钮
    if (col.key === 'actions' && !col.render) {
      return {
        ...col,
        render: (row: any) => {
          // 收集所有按钮
          const buttons: TableButton[] = []

          // 添加自定义按钮（来自列配置）
          if (col.buttons) {
            buttons.push(...col.buttons)
          }

          // 添加系统操作按钮（如果没有在自定义按钮中定义）
          const hasDetail = buttons.some(btn => btn.text === '详情')
          const hasEdit = buttons.some(btn => btn.text === '编辑')
          const hasDelete = buttons.some(btn => btn.text === '删除')

          if (!hasDetail) {
            buttons.push({
              text: '详情',
              type: 'info',
              onClick: () => openModal('view', row)
            })
          }

          if (props.config?.updateApi && !hasEdit) {
            buttons.push({
              text: '编辑',
              type: 'primary',
              onClick: () => openModal('edit', row)
            })
          }

          if (props.config?.deleteApi && !hasDelete) {
            buttons.push({
              text: '删除',
              type: 'error',
              onClick: () => handleDelete(row)
            })
          }

          return buttons.map((btn: TableButton, index: number) =>
              h(NButton, {
                key: index,
                type: btn.type || 'default',
                size: 'small',
                onClick: () => btn.onClick(row),
                style: {marginRight: '8px'}
              }, {default: () => btn.text})
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
