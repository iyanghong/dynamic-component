<template>
  <n-tabs type="line" animated>
    <n-tab-pane name="table" tab="动态表格">
      <DemoTable></DemoTable>
    </n-tab-pane>
    <n-tab-pane name="form" tab="动态表单">
      <DemoForm></DemoForm>
    </n-tab-pane>

    
  </n-tabs>
</template>

<script setup lang="ts">

import { NTabs, NTabPane } from 'naive-ui'
import DemoForm from "@/views/DemoForm.vue";
import DemoTable from "@/views/DemoTable.vue";


</script>

<style scoped>
.n-card {
  margin-bottom: 20px;
}
</style>
