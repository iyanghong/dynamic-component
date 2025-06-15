<template>
  <n-card title="基础表格">
    <DynamicTable :config="{}" :columns="basicColumns" :data="basicData" width="600px" height="200px"/>
  </n-card>

  <n-card title="分页表格" style="margin-top: 20px;">
    <DynamicTable 
      :config="pageConfig"
      :columns="pageColumns"
      :pagination="{ pageSize: 5 }"
      width="80%"
      height="300px"
    />
  </n-card>

  <n-card title="自定义渲染" style="margin-top: 20px;">
    <DynamicTable 
      :config="customConfig"
      :columns="customColumns"
      :width="700"
      :height="250"
    />
  </n-card>

<n-card title="带搜索的动态表格" style="margin-top: 20px;">
    <DynamicTable 
      :config="searchTableConfig"
      :columns="searchColumns"
      width="80%"
      height="300px"
    />
</n-card>

<n-card title="非分页表格" style="margin-top: 20px;">
    <DynamicTable 
      :config="nonPagedConfig"
      :columns="nonPagedColumns"
      width="80%"
      height="300px"
    />
</n-card>
</template>
<script setup lang="ts">
// 表格示例数据
import DynamicTable from "@/components/DynamicComponent/DynamicTable/DynamicTable.vue";
import { NCard, NButton, useMessage } from "naive-ui";
import { h, ref } from "vue";
import type { TableProps } from "@/components/DynamicComponent/DynamicTable/types";
import type { FormField } from "@/components/DynamicComponent/DynamicForm/types";
import { ServiceResult, ServicePage } from '@/types/response-utils.ts';

const basicColumns = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' }
]
const basicData = ref([
  { id: 1, name: '项目1' },
  { id: 2, name: '项目2' }
])

const pageColumns = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' },
  { title: '创建时间', key: 'createTime' }
]
const pageData = ref(Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `项目${i + 1}`,
  createTime: `2023-01-${String(i + 1).padStart(2, '0')}`
})))

const customColumns = [
  {
    title: '状态',
    key: 'status',
    render: (row: any) => row.status ? '启用' : '禁用'
  },
  {
    title: '操作',
    key: 'actions',
    render: (row: any) => h(
      NButton,
      {
        text: true,
        type: 'error',
        onClick: () => handleDelete(row)
      },
      { default: () => '删除' }
    )
  }
]
// 基础表格配置
const basicConfig: TableProps = {
  pagination: false,
  getAllApi: () => new Promise((resolve) => {
    setTimeout(() => {
      const result = new ServiceResult<any[]>()
      result.ofSuccess('', basicData.value)
        resolve(result)
      }, 500)
    }),
    getApi: (id: string) => new Promise((resolve) => {
      setTimeout(() => {
        const item = pageData.value.find(item => item.id === parseInt(id))
        const result = new ServiceResult<any>()
        if (item) {
          result.ofSuccess('获取成功', item)
        } else {
          result.ofFaild('未找到数据', null)
        }
        resolve(result)
      }, 300)
    })
  }

// 分页表格配置
const pageConfig: TableProps = {
  pagination: true,
  getPageApi: (param: any) => new Promise((resolve) => {
    setTimeout(() => {
      const { pageIndex, pageSize } = param
      const start = (pageIndex - 1) * pageSize
      const end = pageIndex * pageSize
      const data = pageData.value.slice(start, end)
      
      const pageResult = new ServicePage()
      pageResult.records = data
      pageResult.total = pageData.value.length
      pageResult.pageIndex = pageIndex
      pageResult.pageSize = pageSize
      
      const result = new ServiceResult<ServicePage<any>>()
      result.ofSuccess('获取成功', pageResult)
      resolve(result)
    }, 500)
  })
}

// 自定义渲染表格配置
const message = useMessage()
const customConfig: TableProps = {
  pagination: false,
  getAllApi: () => new Promise((resolve) => {
    setTimeout(() => {
      const result = new ServiceResult<any[]>()
      result.ofSuccess('获取成功', customData.value)
      resolve(result)
    }, 500)
  }),
  deleteApi: (row: any) => new Promise((resolve) => {
    setTimeout(() => {
      const index = customData.value.findIndex(item => item === row)
      const result = new ServiceResult<boolean>()
      
      if (index !== -1) {
        customData.value.splice(index, 1)
        message.success('删除成功')
        result.ofSuccess('删除成功', true)
      } else {
        result.ofFaild('删除失败', false)
      }
      
      resolve(result)
    }, 500)
  })
}

const customData = ref([
  { id: 1, status: true },
  { id: 2, status: false }
])

const handleDelete = (row: any) => {
  customConfig.deleteApi?.(row)
}

// 搜索字段定义（放在searchTableConfig之前）
const searchFields: FormField[] = [
  {
    type: 'input',
    label: '名称',
    field: 'name',
    showInSimple: true
  },
  {
    type: 'select',
    label: '类别',
    field: 'category',
    options: [
      { label: '全部', value: '' },
      { label: '电子产品', value: 'electronics' },
      { label: '服装', value: 'clothing' },
      { label: '食品', value: 'food' }
    ],
    showInSimple: true
  },
  {
    type: 'select',
    label: '状态',
    field: 'status',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 'true' },
      { label: '禁用', value: 'false' }
    ]
  }
]

const searchColumns = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' },
  { title: '类别', key: 'category' },
  { title: '状态', key: 'status', render: (row: any) => row.status ? '启用' : '禁用' },
  {
    title: '操作',
    key: 'actions',
    buttons: [
      {
        text: '复制',
        type: 'warning' as 'warning',
        onClick: (row: any) => {
          message.info(`复制了 ${row.name}`)
        }
      }
    ]
  }
]

// 带搜索的动态表格配置（分页模式）
const searchTableConfig: TableProps = {
  pagination: true,
  getPageApi: (param: any) => new Promise((resolve) => {
    setTimeout(() => {
      const { pageIndex, pageSize, ...filters } = param
      // 模拟根据搜索条件过滤数据
      let data = searchTableData.value.filter(item => {
        for (const key in filters) {
          // 使用类型断言解决 TypeScript 错误
          const itemValue = (item as any)[key];
          if (filters[key] && itemValue != filters[key]) {
            return false
          }
        }
        return true
      })
      
      const start = (pageIndex - 1) * pageSize
      const end = pageIndex * pageSize
      const pageData = data.slice(start, end)
      
      const pageResult = new ServicePage()
      pageResult.records = pageData
      pageResult.total = data.length
      pageResult.pageIndex = pageIndex
      pageResult.pageSize = pageSize
      
      const result = new ServiceResult<ServicePage<any>>()
      result.ofSuccess('查询成功', pageResult)
      resolve(result)
    }, 500)
  }),
  searchFields: searchFields,  // 添加搜索字段配置
  formSchema: searchFields,    // 表单字段配置
  createApi: (data: any) => new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...searchTableData.value.map(i => i.id)) + 1
      const newItem = { ...data, id: newId }
      searchTableData.value.push(newItem)
      
      const result = new ServiceResult<any>()
      result.ofSuccess('新增成功', newItem)
      resolve(result)
    }, 300)
  }),
  updateApi: (data: any) => new Promise((resolve) => {
    setTimeout(() => {
      const index = searchTableData.value.findIndex(item => item.id === data.id)
      const result = new ServiceResult<boolean>()
      
      if (index !== -1) {
        searchTableData.value[index] = { ...searchTableData.value[index], ...data }
        result.ofSuccess('更新成功', true)
      } else {
        result.ofFaild('更新失败', false)
      }
      
      resolve(result)
    }, 300)
  }),
  deleteApi: (row: any) => new Promise((resolve) => {
    setTimeout(() => {
      const index = searchTableData.value.findIndex(item => item.id === row.id)
      const result = new ServiceResult<boolean>()
      
      if (index !== -1) {
        searchTableData.value.splice(index, 1)
        result.ofSuccess('删除成功', true)
      } else {
        result.ofFaild('删除失败', false)
      }
      
      resolve(result)
    }, 300)
  })
}

// 非分页表格配置
const nonPagedColumns = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' },
  { title: '类别', key: 'category' },
  { title: '状态', key: 'status', render: (row: any) => row.status ? '启用' : '禁用' },
  {
    title: '操作',
    key: 'actions',
    buttons: [
      {
        text: '打印',
        type: 'success' as 'success',
        onClick: (row: any) => {
          message.info(`打印了 ${row.name}`)
        }
      }
    ]
  }
]

const nonPagedConfig: TableProps = {
  pagination: false,
    getAllApi: () => new Promise((resolve) => {
      setTimeout(() => {
      const result = new ServiceResult<any[]>()
      result.ofSuccess('获取成功', searchTableData.value)
        resolve(result)
      }, 300)
    }),
    getApi: (id: string) => new Promise((resolve) => {
      setTimeout(() => {
        const item = searchTableData.value.find(item => item.id === parseInt(id))
        const result = new ServiceResult<any>()
        if (item) {
          result.ofSuccess('获取成功', item)
        } else {
          result.ofFaild('未找到数据', null)
        }
        resolve(result)
      }, 300)
    }),
  searchFields: searchFields,  // 添加搜索字段配置
  formSchema: searchFields,    // 表单字段配置
  createApi: (data: any) => new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...searchTableData.value.map(i => i.id)) + 1
      const newItem = { ...data, id: newId }
      searchTableData.value.push(newItem)
      
      const result = new ServiceResult<any>()
      result.ofSuccess('新增成功', newItem)
      resolve(result)
    }, 300)
  }),
  updateApi: (data: any) => new Promise((resolve) => {
    setTimeout(() => {
      const index = searchTableData.value.findIndex(item => item.id === data.id)
      const result = new ServiceResult<boolean>()
      
      if (index !== -1) {
        searchTableData.value[index] = { ...searchTableData.value[index], ...data }
        message.success('更新成功')
        result.ofSuccess('更新成功', true)
      } else {
        result.ofFaild('更新失败', false)
      }
      
      resolve(result)
    }, 300)
  }),
  deleteApi: (row: any) => new Promise((resolve) => {
    setTimeout(() => {
      const index = searchTableData.value.findIndex(item => item.id === row.id)
      const result = new ServiceResult<boolean>()
      
      if (index !== -1) {
        searchTableData.value.splice(index, 1)
        message.success('删除成功')
        result.ofSuccess('删除成功', true)
      } else {
        result.ofFaild('删除失败', false)
      }
      
      resolve(result)
    }, 300)
  })
}

const handleNonPagedDelete = (row: any) => {
  nonPagedConfig.deleteApi?.(row)
}

const searchTableData = ref([
  { id: 1, name: '手机', category: 'electronics', status: true },
  { id: 2, name: '电脑', category: 'electronics', status: true },
  { id: 3, name: 'T恤', category: 'clothing', status: true },
  { id: 4, name: '牛仔裤', category: 'clothing', status: false },
  { id: 5, name: '苹果', category: 'food', status: true },
  { id: 6, name: '香蕉', category: 'food', status: false },
  { id: 7, name: '平板', category: 'electronics', status: true },
  { id: 8, name: '帽子', category: 'clothing', status: true },
  { id: 9, name: '牛奶', category: 'food', status: true },
  { id: 10, name: '耳机', category: 'electronics', status: false }
])
</script>
<style scoped>

</style>
