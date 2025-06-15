<template>
  <CleverPopup v-model:visible="visiblePopup" :title="popupTitle">
    <DynamicForm
        v-if="visiblePopup" v-bind="formProp" ref="formRef" @success="handleFormSuccess" :disabled="mode == 'view'"
        @cancel="close"></DynamicForm>
  </CleverPopup>
</template>
<script setup lang="ts">
import DynamicForm from "./DynamicForm.vue";
import CleverPopup from "../clever-popup/index.vue";
import {nextTick, type PropType, ref} from "vue";
import {isFunction, isAsyncFunction, isObject} from '../utils'
import type {FormProps} from "./types.ts";
import {useMessage} from "naive-ui";

const props = defineProps({
  title: {
    type: String,
    default: () => ''
  },
  width: {
    type: [Number, String],
    default: () => 'auto'
  },
  mode: {
    type: String as PropType<'modal' | 'drawer'>,
    default: () => 'modal'
  },
  placement: {
    type: String as PropType<'top' | 'right' | 'bottom' | 'left'>,
    default: () => 'top'
  },
  formProp: {
    type: Object as PropType<FormProps>,
    required: true
  }
})

const emit = defineEmits(['on-close', 'on-success', 'on-cancel'])
const message = useMessage()
const visiblePopup = ref(false)
const formRef = ref()
const mode = ref<'edit' | 'view'>('edit')
const popupTitle = ref(props.title)

function open(data: Record<string, any>, isDetail = false) {
  visiblePopup.value = true;
  if (isDetail){
    mode.value = 'view'
  }else{
    mode.value = 'edit'
  }
  nextTick(async () => {
    if (isObject(data)) {
      if (props.formProp.getApi && (isFunction(props.formProp.getApi) || isAsyncFunction(props.formProp.getApi))) {
        const response = await props.formProp.getApi(data);
        if (response.code === 0) {
          formRef.value?.setFormData(response.data);
        } else {
          message.error(response.message);
        }
      } else {
        formRef.value?.setFormData(data);
      }
    }
  });
}

function close(flag = false) {
  visiblePopup.value = false
  if (!flag) {
    emit('on-cancel')
  }
  emit('on-close')
}

function handleFormSuccess() {
  emit('on-success')
  close()
}

defineExpose({
  open,
  close
})
</script>
<style scoped>

</style>