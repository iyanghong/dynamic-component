<script setup lang="ts">
import type { CleverPopupProps } from './types';
import {computed} from "vue";

const props = withDefaults(defineProps<CleverPopupProps>(), {
  title: '',
  width: 360,
  placement: 'left',
  mode: 'modal'
});

/** @description: 判断值是否未某个类型 */
function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}
/** @description: 是否为数值 */
function isNumber(val: unknown): val is number {
  return is(val, 'Number');
}
const visible = defineModel<boolean>('visible', {
  default: false
});

const width = computed(() => {
  if (isNumber(props.width)) {
    return `${props.width}px`;
  }
  return props.width;
});
</script>

<template>
  <NModal
    v-if="props.mode == 'modal'"
    v-model:show="visible"
    :title="props.title"
    preset="card"
    :style="{ width: width }"
  >
    <NScrollbar class="pr-20px">
      <slot></slot>
    </NScrollbar>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </NModal>
  <NDrawer
    v-else
    v-model:show="visible"
    :title="props.title"
    :placement="props.placement"
    display-directive="show"
    :width="width"
  >
    <NDrawerContent :title="props.title" :native-scrollbar="false" closable>
      <slot></slot>
      <template #footer>
        <slot name="footer"></slot>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
