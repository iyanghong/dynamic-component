<template>
  <div v-if="!field.hidden" class="form-field">
    <component
      :is="getFieldComponent(field.type)"
      v-bind="{
        ...getFieldProps(field),
        status,
        'feedback-text': feedback,
        'validation-status': status
      }"
      v-model:value="modelValue"
      :style="fieldStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  NInput,
  NSelect,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NDatePicker,
  NSwitch,
  NInputNumber
} from 'naive-ui'
import type { FormField } from './types'

const props = defineProps<{
  field: FormField
  modelValue: any
  status?: 'error' | 'success' | 'warning'
  feedback?: string
}>()

const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get: () => {
    const rawValue = props.modelValue
    if (props.field.getValueFormatter) {
      return props.field.getValueFormatter(rawValue, {})
    }
    return rawValue
  },
  set: (value) => {
    let formattedValue = value
    if (props.field.setValueFormatter) {
      formattedValue = props.field.setValueFormatter(value, {})
    }
    emit('update:modelValue', formattedValue)
  }
})


const fieldStyle = computed(() => {
  const width = props.field.width
  if (!width) return {}
  
  return {
    width: typeof width === 'number' ? `${width}px` : width
  }
})

const componentMap: Record<string, any> = {
  input: NInput,
  password: NInput,
  select: NSelect,
  checkbox: NCheckbox,
  radio: NRadioGroup,
  date: NDatePicker,
  switch: NSwitch,
  number: NInputNumber
}

function getFieldComponent(type: string) {
  return componentMap[type] || NInput
}

function getFieldProps(field: FormField) {
  const baseProps = {
    placeholder: field.placeholder || `请输入${field.label}`,
    disabled: field.disabled,
    clearable: field.clearable
  }

  switch(field.type) {
    case 'select':
      return {
        ...baseProps,
        options: field.options,
        filterable: field.filterable
      }
    case 'radio':
      return {
        ...baseProps,
        options: field.options?.map(opt => ({
          label: opt.label,
          value: opt.value
        }))
      }
    case 'checkbox':
      return {
        ...baseProps,
        label: field.label
      }
    default:
      return baseProps
  }
}
</script>

<style scoped>
.form-field {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.field-label {
  margin-right: 8px;
  /* font-weight: bold; */
}
</style>
