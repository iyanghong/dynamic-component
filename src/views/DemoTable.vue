<template>
  <n-card title="基础表格">
    <DynamicTable :columns="basicColumns" :data="basicData" width="600px" height="200px"/>
  </n-card>

  <n-card title="分页表格" style="margin-top: 20px;">
    <DynamicTable :columns="pageColumns" :data="pageData" :pagination="{ pageSize: 5 }" width="80%"
                  height="300px"/>
  </n-card>

  <n-card title="自定义渲染" style="margin-top: 20px;">
    <DynamicTable :columns="customColumns" :data="customData" :width="700" :height="250"/>
  </n-card>
</template>
<script setup lang="ts">
// 表格示例数据
import DynamicTable from "@/components/DynamicComponent/DynamicTable/DynamicTable.vue";
import {NCard} from "naive-ui";
import {ref} from "vue";

const basicColumns = [
  {title: 'ID', key: 'id'},
  {title: '名称', key: 'name'}
]
const basicData = ref([
  {id: 1, name: '项目1'},
  {id: 2, name: '项目2'}
])

const pageColumns = [
  {title: 'ID', key: 'id'},
  {title: '名称', key: 'name'},
  {title: '创建时间', key: 'createTime'}
]
const pageData = ref(Array.from({length: 15}, (_, i) => ({
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
  {title: '操作', key: 'actions'}
]
const customData = ref([
  {status: true},
  {status: false}
])
</script>
<style scoped>

</style>