<template>
  <div class="demo-table-container">
    <h2>动态表格示例</h2>
    <DynamicTable 
      :config="tableConfig" 
      :columns="tableColumns" 
      :pagination="pagination"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import DynamicTable from '@/components/DynamicComponent/DynamicTable/DynamicTable.vue';
import type { TableProps, TableConfig, TableColumn } from '@/components/DynamicComponent/DynamicTable/types';

// 模拟数据
let mockData = [
  { id: 1, name: '张三', age: 28, department: '技术部', position: '前端工程师' },
  { id: 2, name: '李四', age: 32, department: '产品部', position: '产品经理' },
  { id: 3, name: '王五', age: 25, department: '设计部', position: 'UI设计师' },
  { id: 4, name: '赵六', age: 30, department: '技术部', position: '后端工程师' },
  { id: 5, name: '钱七', age: 29, department: '市场部', position: '市场专员' },
];

// API 函数定义 - 独立于 tableConfig
const createApi = async (data: Record<string, unknown>) => {
  console.log('创建数据:', data);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 生成新ID (当前最大ID + 1)
  const newId = Math.max(...mockData.map(item => item.id)) + 1;
  const newItem = { ...data, id: newId } as any;
  mockData.unshift(newItem); // 添加到数组开头
  
  return {
    code: 200,
    success: true,
    message: '创建成功',
    data: newItem
  } as any;
};

const updateApi = async (data: Record<string, unknown>) => {
  console.log('更新数据:', data);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 安全获取id
  const id = data.id as number;
  const index = mockData.findIndex(item => item.id === id);
  
  if (index !== -1) {
    mockData[index] = { ...mockData[index], ...data } as any;
    return {
      code: 200,
      success: true,
      message: '更新成功',
      data: mockData[index]
    } as any;
  } else {
    return {
      code: 404,
      success: false,
      message: '未找到对应数据',
      data: null
    } as any;
  }
};

const getApi = async (params: Record<string, unknown>) => {
  // 安全获取id
  const id = params.id as number;
  console.log('获取数据:', id);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const item = mockData.find(item => item.id === id);
  if (item) {
    return {
      code: 200,
      success: true,
      message: '获取成功',
      data: item
    } as any;
  } else {
    return {
      code: 404,
      success: false,
      message: '未找到对应数据',
      data: null
    } as any;
  }
};

const deleteApi = async (params: Record<string, unknown>) => {
  // 安全获取id
  const id = params.id as number;
  console.log('删除数据:', id);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockData.findIndex(item => item.id === id);
  if (index !== -1) {
    mockData.splice(index, 1);
    return {
      code: 200,
      success: true,
      message: '删除成功',
      data: null
    } as any;
  } else {
    return {
      code: 404,
      success: false,
      message: '未找到对应数据',
      data: null
    } as any;
  }
};

const getAllApi = async (params: Record<string, unknown>) => {
  console.log('获取所有数据:', params);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 应用搜索条件
  let filteredData = [...mockData];
  
  // 安全获取参数值
  const name = params.name as string || '';
  const department = params.department as string || '';
  const position = params.position as string || '';
  
  if (name) {
    filteredData = filteredData.filter(item => 
      item.name.includes(name)
    );
  }
  
  if (department) {
    filteredData = filteredData.filter(item => 
      item.department === department
    );
  }
  
  if (position) {
    filteredData = filteredData.filter(item => 
      item.position.includes(position)
    );
  }
  
  return {
    code: 200,
    success: true,
    message: '请求成功',
    data: filteredData
  } as any;
};

const getPageApi = async (params: Record<string, unknown>) => {
  console.log('分页请求参数:', params);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 安全获取参数值
  const pageIndex = params.pageIndex as number || 1;
  const pageSize = params.pageSize as number || 5;
  const searchParams = { ...params } as Record<string, unknown>;
  delete searchParams.pageIndex;
  delete searchParams.pageSize;
  
  // 使用getAllApi获取过滤后的数据
  const result = await getAllApi(searchParams);
  if (!result.success || !result.data) {
    return result; // 返回错误
  }
  
  const filteredData = result.data as any[];
  
  // 分页处理
  const start = (pageIndex - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredData.slice(start, end);
  
  return {
    code: 200,
    success: true,
    message: '请求成功',
    data: {
      records: pageData,
      total: filteredData.length,
      pageIndex,
      pageSize
    }
  } as any;
};

const onApiError = (error: any, type: string) => {
  console.error(`API 错误 (${type}):`, error);
  
  // 安全获取错误消息
  let errorMessage = '未知错误';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = (error as any).message;
  }
  
  alert(`操作失败: ${errorMessage}`);
};

// 表格配置
const tableConfig = reactive<TableProps>({
  // 分页配置
  pagination: true,
  pageSize: 5,
  
  // 搜索字段配置
  searchFields: [
    {
      field: 'name',
      label: '姓名',
      type: 'input',
      showInSimple: true
    },
    {
      field: 'department',
      label: '部门',
      type: 'select',
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '市场部', value: '市场部' }
      ],
      showInSimple: true
    },
    {
      field: 'position',
      label: '职位',
      type: 'input',
      showInSimple: false
    }
  ],
  
  // 使用外部定义的 API 函数
  createApi: createApi,
  updateApi: updateApi,
  getApi: getApi,
  deleteApi: deleteApi,
  getAllApi: getAllApi,
  getPageApi: getPageApi,
  
  // 操作配置
  actions: ['view', 'edit', 'delete'],
  
  // 错误处理
  onApiError: (error, type) => {
    console.error(`API 错误 (${type}):`, error);
    
    // 安全获取错误消息
    let errorMessage = '未知错误';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message;
    }
    
    alert(`操作失败: ${errorMessage}`);
  }
});

// 表格列配置
const tableColumns: TableColumn[] = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '姓名', key: 'name' },
  { title: '年龄', key: 'age' },
  { title: '部门', key: 'department' },
  { title: '职位', key: 'position' },
  { 
    title: '操作', 
    key: 'actions',
    width: 200
  }
];

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 5,
  showSizePicker: true,
  pageSizes: [5, 10, 20],
  onChange: (page: number) => {
    pagination.page = page;
  },
  onUpdatePageSize: (size: number) => {
    pagination.pageSize = size;
    pagination.page = 1;
  }
});
</script>

<style scoped>
.demo-table-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}
</style>
