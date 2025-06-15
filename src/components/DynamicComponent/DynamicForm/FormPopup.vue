<template>
  <CleverPopup v-model:visible="modalVisible" :title="modalTitle">
    <DynamicForm
        v-if="modalVisible" v-bind="formProp" ref="formRef" @success="handleFormSuccess"
        @cancel="close"></DynamicForm>
  </CleverPopup>
</template>
<script setup lang="ts">
import DynamicForm from "./DynamicForm.vue";
import CleverPopup from "../clever-popup/index.vue";
import {ref} from "vue";

const modalVisible = ref(false)
const formProp = ref()


function open(data: Record<string, any>, apiFn?: GetApiFn<Record<string, any>>) {
  visiblePopup.value = true;
  nextTick(async () => {
    if (isObject(data)) {
      if (apiFn && (isFunction(apiFn) || isAsyncFunction(apiFn))) {
        const response = await apiFn(data);
        if (response.code === 0) {
          setFormData(response.data);
        } else {
          message.error(response.message);
        }
      } else {
        setFormData(data);
      }
    }
  });
}

function close() {
  modalVisible.value = false
}

function handleFormSuccess() {
  close()
}

defineExpose({})
</script>
<style scoped>

</style>