# Dynamic Form & Table Components for Vue3

[![Vue3](https://img.shields.io/badge/Vue-3.4-green)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-orange)](https://vitejs.dev/)
[![NaiveUI](https://img.shields.io/badge/NaiveUI-2.0-lightgrey)](https://www.naiveui.com/)

## 项目概述

基于Vue3+TypeScript+Vite技术栈，使用NaiveUI作为UI框架，封装动态表单和动态表格组件，通过JSON配置自动渲染表单和表格。

## 技术栈

- Vue 3.4
- TypeScript 5.0
- Vite 5.0
- NaiveUI 2.0
- PNPM 8.0
- Node.js 22.13.0

## 安装

```bash
pnpm install
```

## 使用说明

### 动态表单组件 (DynamicForm)

#### 基本用法

```vue
<template>
  <DynamicForm :filedSchema="schema" v-model="formData" />
</template>

<script setup>
import DynamicForm from '@/components/DynamicComponent/DynamicForm/DynamicForm.vue'
import { ref } from 'vue'

const formData = ref({})
const schema = [
  {
    title: '基本信息',
    columns: 2,
    fields: [
      { type: 'input', label: '姓名', field: 'name' },
      { type: 'select', label: '性别', field: 'gender', 
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    ]
  }
]
</script>
```

#### Schema 配置

表单通过 `filedSchema` 属性配置，支持分组和多种字段类型：

```typescript
interface FormLayoutItem {
  title?: string // 分组标题
  columns?: number // 分组列数 (默认1)
  fields: FormField[] // 字段数组
  collapsible?: boolean // 是否可收缩 (默认true)
  defaultExpanded?: boolean // 默认是否展开 (默认false)
}

interface FormField {
  type: 'input' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'switch' | 'number'
  label: string // 字段标签
  field: string // 字段名 (对应v-model中的key)
  defaultValue?: any // 默认值
  rules?: Array<{ // 验证规则
    required?: boolean
    message?: string
    validator?: Function
  }>
  options?: Array<{ // select/radio选项
    label: string
    value: any
  }>
  span?: number // 跨列数 (默认1)
  row?: number // 所在行号
  width?: string | number // 字段宽度
  labelPosition?: 'left' | 'top' // 标签位置
  disabled?: boolean // 是否禁用
  placeholder?: string // 占位文本
}
```

#### API 配置

支持配置CRUD接口自动处理表单提交：

```vue
<DynamicForm
  :filedSchema="schema"
  v-model="formData"
  :get-api="getUser"
  :create-api="createUser"
  :update-api="updateUser"
  @success="handleSuccess"
  @error="handleError"
/>
```

##### API 类型定义

```typescript
// 获取数据接口
type GetApi = (id: string) => Promise<ServiceResult<Record<string, any>>>

// 创建数据接口 
type CreateApi = (data: Record<string, any>) => Promise<ServiceResult<Record<string, any>>>

// 更新数据接口
type UpdateApi = (data: Record<string, any>) => Promise<ServiceResult<Record<string, any>>>

// 使用示例
async function getUser(id: string) {
  return {
    code: 200,
    success: true,
    message: '获取成功',
    data: { id, name: '张三' }
  }
}

async function createUser(data: any) {
  return {
    code: 200,
    success: true,
    message: '创建成功',
    data: { ...data, id: Date.now() }
  }
}

async function updateUser(data: any) {
  return {
    code: 200, 
    success: true,
    message: '更新成功',
    data
  }
}
```

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| validate | 字段验证 | `(errors: Record<string, string[]>)` |
| success | 提交成功 | `(data: any)` |
| error | 提交失败 | `(error: Error)` |
| init | 初始化完成 | `({ isEdit: boolean, formData: any })` |
| field-change | 字段值变化 | `(field: string, value: any, formData: any)` |
| before-submit | 提交前 | `(formData: any)` |
| after-submit | 提交后 | `({ isEdit: boolean, formData: any })` |
| before-reset | 重置前 | `(formData: any)` |
| after-reset | 重置后 | `({ isEdit: boolean, formData: any })` |

#### 方法

通过ref调用组件方法：

```vue
<template>
  <DynamicForm ref="formRef" ... />
</template>

<script setup>
const formRef = ref()

// 手动验证表单
formRef.value.validate()

// 重置验证状态
formRef.value.restoreValidation()
</script>
```

#### 完整示例

参考 `src/views/DemoForm.vue` 中的实现，包含：
- 分组表单
- 多列布局
- 不可收缩分组
- 混合分组与非分组
- API表单示例

## 接口规范

所有接口返回遵循 `ServiceResult<T>` 格式：

```typescript
interface ServiceResult<T> {
  code: number;
  success: boolean;
  message: string;
  data: T | null;
}

interface ServicePage<T> {
  pageIndex: number;
  pageSize: number;
  total: number;
  records: T[];
}
```

## 开发指南

1. 安装依赖
```bash
pnpm install
```

2. 启动开发服务器
```bash
pnpm dev
```

3. 构建生产版本
```bash
pnpm build
```

## 关键词

Vue3, TypeScript, Vite, NaiveUI, 动态表单, 动态表格, JSON配置, 组件封装, 前端开发
