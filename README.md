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

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| schema | `FormSchema` | - | 表单配置JSON |
| modelValue | `Record<string, any>` | {} | 表单数据 |
| layout | `'horizontal' | 'vertical'` | 'horizontal' | 表单布局 |
| disabled | `boolean` | false | 是否禁用表单 |

#### FormSchema 类型

```typescript
interface FormSchema {
  width?: string | number; // 表单宽度，例如 '100%' 或 800
  layout: FormLayoutItem[]; // 表单布局项数组
}

// 表单布局项可以是单个字段或一个字段组
type FormLayoutItem = FormField | FormGroup;

interface FormField {
  type: 'input' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'switch' | 'number';
  label: string; // 字段标签
  field: string; // 字段对应的 modelValue 键
  defaultValue?: any; // 默认值
  rules?: Array<{ required?: boolean; message?: string; validator?: Function }>; // 验证规则
  options?: Array<{ label: string; value: any }>; // select 和 radio 类型的选项
  span?: number; // 占用列数 (在 n-grid 中使用)
  width?: string | number; // 字段宽度，例如 '100%' 或 200
  row?: number; // 字段所在的行 (用于多行布局)
  labelPosition?: 'left' | 'top'; // 标签位置 (覆盖全局设置)
  disabled?: boolean; // 是否禁用
  clearable?: boolean; // 是否可清空
  placeholder?: string; // 占位符
  filterable?: boolean; // select 是否可过滤
}

interface FormGroup {
  title?: string; // 分组标题，如果存在则显示标题
  columns?: number; // 每行列数 (1-4)，默认为 1
  fields: FormField[]; // 组内的字段数组
  collapsible?: boolean; // 是否可收缩，默认为 true。如果为 false 且有 title，则显示为 n-card
  defaultExpanded?: boolean; // 默认是否展开，默认为 false (仅对可收缩分组有效)
}
```

#### 示例

<div class="tabs">
  <button class="tab-button active" onclick="openTab(event, 'form-comprehensive')">全面布局示例</button>
  <button class="tab-button" onclick="openTab(event, 'form-basic')">基础字段</button>
  <button class="tab-button" onclick="openTab(event, 'form-group-collapsible')">可收缩分组</button>
  <button class="tab-button" onclick="openTab(event, 'form-group-non-collapsible')">不可收缩分组</button>
  <button class="tab-button" onclick="openTab(event, 'form-multi-column')">无标题多列</button>
</div>

<div id="form-comprehensive" class="tab-content" style="display: block;">
```vue
<template>
  <DynamicForm :schema="comprehensiveSchema" v-model="formData" />
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({});
const comprehensiveSchema = {
  width: '900px',
  layout: [
    // 顶部直接显示的单个字段，无分组
    { type: 'input', label: '个人简介', field: 'profile', span: 3, row: 0, labelPosition: 'top' },
    {
      // 一个普通的、默认展开的两列分组
      title: '账户信息',
      columns: 2,
      defaultExpanded: true,
      fields: [
        { type: 'input', label: '用户名', field: 'username', row: 0, width: '200px' },
        { type: 'password', label: '密码', field: 'password', row: 0, width: '200px' },
        { type: 'input', label: '邮箱', field: 'email', row: 1, span: 2, labelPosition: 'left' },
      ]
    },
    // 带有标题但不可收缩的分组（显示为卡片）
    {
      title: '个人偏好',
      collapsible: false,
      columns: 3,
      fields: [
        { type: 'checkbox', label: '接收邮件通知', field: 'emailNotify', row: 0 },
        { type: 'switch', label: '启用深色模式', field: 'darkMode', row: 0 },
        { type: 'number', label: '每页显示', field: 'itemsPerPage', row: 0, defaultValue: 10, width: '120px' },
      ]
    },
    // 无标题、不可收缩的多列字段块
    {
      collapsible: false, // 明确指出不可收缩
      columns: 2,
      fields: [
        { type: 'date', label: '注册日期', field: 'registerDate', row: 0, width: '180px' },
        {
          type: 'select', label: '所在地区', field: 'region',
          options: [
            { label: '北京', value: 'beijing' },
            { label: '上海', value: 'shanghai' },
            { label: '广州', value: 'guangzhou' }
          ],
          row: 0,
          width: '180px'
        },
      ]
    },
    // 另一个直接显示的单个字段
    { type: 'input', label: '备注', field: 'notes', span: 3, row: 0, labelPosition: 'top' },
  ]
};
</script>
```
</div>

<div id="form-basic" class="tab-content">
```vue
<template>
  <DynamicForm :schema="basicSchema" v-model="formData" />
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({});
const basicSchema = {
  layout: [
    { type: 'input', label: '用户名', field: 'username' },
    { type: 'password', label: '密码', field: 'password' }
  ]
};
</script>
```
</div>

<div id="form-group-collapsible" class="tab-content">
```vue
<template>
  <DynamicForm :schema="collapsibleGroupSchema" v-model="formData" />
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({});
const collapsibleGroupSchema = {
  layout: [
    {
      title: '基本信息',
      defaultExpanded: true,
      columns: 2,
      fields: [
        { type: 'input', label: '姓名', field: 'name' },
        { type: 'select', label: '性别', field: 'gender', options: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }] }
      ]
    }
  ]
};
</script>
```
</div>

<div id="form-group-non-collapsible" class="tab-content">
```vue
<template>
  <DynamicForm :schema="nonCollapsibleGroupSchema" v-model="formData" />
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({});
const nonCollapsibleGroupSchema = {
  width: '500px',
  layout: [
    {
      title: '不可收缩分组',
      collapsible: false,
      fields: [
        { type: 'input', label: '字段A', field: 'fieldA' },
        { type: 'input', label: '字段B', field: 'fieldB' }
      ]
    }
  ]
};
</script>
```
</div>

<div id="form-multi-column" class="tab-content">
```vue
<template>
  <DynamicForm :schema="multiColumnSchema" v-model="formData" />
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({});
const multiColumnSchema = {
  width: 800,
  layout: [
    {
      collapsible: false, // 无标题的字段块应明确设置为不可收缩
      columns: 3,
      fields: [
        { type: 'input', label: '字段1', field: 'field1', span: 1 },
        { type: 'input', label: '字段2', field: 'field2', span: 2 },
        { type: 'input', label: '字段3', field: 'field3', span: 3, labelPosition: 'top' }
      ]
    }
  ]
};
</script>
```
</div>

### 动态表格组件 (DynamicTable)

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `TableColumn[]` | [] | 表格列配置 |
| data | `any[]` | [] | 表格数据 |
| pagination | `boolean | PaginationProps` | true | 分页配置 |
| loading | `boolean` | false | 加载状态 |
| rowKey | `string` | 'id' | 行数据key |

#### TableColumn 类型

```typescript
interface TableColumn {
  title: string;
  key: string;
  width?: number;
  render?: (rowData: any, rowIndex: number) => VNode;
  // 其他NaiveUI表格列props
}
```

#### 示例

<div class="tabs">
  <button class="tab-button active" onclick="openTab(event, 'table-basic')">基础表格</button>
  <button class="tab-button" onclick="openTab(event, 'table-page')">分页表格</button>
  <button class="tab-button" onclick="openTab(event, 'table-custom')">自定义渲染</button>
</div>

<div id="table-basic" class="tab-content" style="display: block;">
```vue
<template>
  <DynamicTable :columns="columns" :data="data"/>
</template>

<script setup>
const columns = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' }
];
const data = ref([...]);
</script>
```


```vue
<template>
  <DynamicTable 
    :columns="columns"
    :data="data"
    :pagination="{ pageSize: 10 }"
    @change="handlePageChange"
  />
</template>

<script setup>
const handlePageChange = (page) => {
  // 获取分页数据
};
</script>
```

```vue
<template>
  <DynamicTable :columns="columns" :data="data"/>
</template>

<script setup>
const columns = [
  { 
    title: '状态',
    key: 'status',
    render: (row) => h('Tag', { type: row.status ? 'success' : 'error' }, 
      row.status ? '启用' : '禁用')
  }
];
</script>
```


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
