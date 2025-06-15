<template>
  <div class="dynamic-form">
    <n-form
        ref="formRef"
        :model="internalFormData"
        :rules="formRules"
        :layout="layout"
        :disabled="disabled"
        :style="formStyle"
        @validate="handleValidate"
        :validate-on-rule-change="false"
    >
      <template v-for="(item, index) in processedSchema.layout" :key="index">
        <!-- 如果是 FormGroup -->
        <template v-if="isFormGroup(item)">
          <!-- 有标题且可收缩的分组 -->
          <n-collapse
              v-if="item.title && item.collapsible !== false"
              :default-expanded-names="defaultExpandedNames"
              :key="`group-collapse-${index}`"
          >
            <n-collapse-item :title="item.title" :name="index">
              <template v-for="row in getGroupRows(item.fields)" :key="row">
                <n-grid :cols="item.columns || 1" :x-gap="12">
                  <n-gi
                      v-for="field in getFieldsInRow(item.fields, row)"
                      :key="field.field"
                      :span="field.span || 1"
                  >
                    <n-form-item
                        :label="field.label"
                        :path="field.field"
                        :label-placement="field.labelPosition || 'left'"
                    >
                      <form-field
                          :field="{ ...field, inGroup: true }"
                          v-model="internalFormData[field.field]"
                      />
                    </n-form-item>
                  </n-gi>
                </n-grid>
              </template>
            </n-collapse-item>
          </n-collapse>
          <!-- 有标题但不可收缩的分组 (例如，作为n-card) -->
          <n-card
              v-else-if="item.title && item.collapsible === false"
              :title="item.title"
              :key="`group-card-${index}`"
              style="margin-bottom: 16px;"
          >
            <template v-for="row in getGroupRows(item.fields)" :key="row">
              <n-grid :cols="item.columns || 1" :x-gap="12">
                <n-gi
                    v-for="field in getFieldsInRow(item.fields, row)"
                    :key="field.field"
                    :span="field.span || 1"
                >
                  <n-form-item
                      :label="field.label"
                      :path="field.field"
                      :label-placement="field.labelPosition || 'left'"
                  >
                    <form-field
                        :field="{ ...field, inGroup: true }"
                        v-model="internalFormData[field.field]"
                    />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </template>
          </n-card>
          <!-- 无标题且不可收缩的"非分组"字段块 -->
          <template v-else>
            <template v-for="row in getGroupRows(item.fields)" :key="row">
              <n-grid :cols="item.columns || 1" :x-gap="12">
                <n-gi
                    v-for="field in getFieldsInRow(item.fields, row)"
                    :key="field.field"
                    :span="field.span || 1"
                >
                  <n-form-item
                      :label="field.label"
                      :path="field.field"
                      :label-placement="field.labelPosition || 'left'"
                  >
                    <form-field
                        :field="{ ...field, inGroup: true }"
                        v-model="internalFormData[field.field]"
                    />
                  </n-form-item>
                </n-gi>
              </n-grid>
            </template>
          </template>
        </template>
      </template>
    </n-form>

    <!-- 表单操作按钮 -->
    <div class="form-actions" v-if="isShowActions">
      <n-space :justify="actionAlign" align="center">
        <n-button
            type="primary"
            @click="handleSave"
            :loading="loading"
        >
          {{ isEdit ? '保存' : '新增' }}
        </n-button>
        <n-button @click="handleReset">重置</n-button>
        <n-button @click="handleCancel">关闭</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed, onMounted, unref, type PropType, nextTick} from 'vue'
import {NForm, NFormItem, NGrid, NGi, NCollapse, NCollapseItem, NCard, NSpace, NButton, useMessage} from 'naive-ui'
import FormField from './FormField.vue'
import type {FormField as FormFieldType, FormGroup, FormLayoutItem} from './types'
import {ServiceResult} from '@/types/response-utils.ts'
import {getDefaultValues} from './utils'
import type {CreateApiFn, GetApiFn, UpdateApiFn} from "@/types/response";
import {isAsyncFunction, isFunction} from "@/components/DynamicComponent/utils";

const props = defineProps({
  filedSchema: {
    type: Object as () => FormLayoutItem[],
    required: true
  },
  width: {
    type: [String, Number],
    default: () => '100%'
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: String as () => 'horizontal' | 'vertical',
    default: 'horizontal'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // API 配置
  getApi: {
    type: Function as PropType<GetApiFn>,
  },
  createApi: {
    type: Function as PropType<CreateApiFn>,
  },
  updateApi: {
    type: Function as PropType<UpdateApiFn>,
  },
  // 是否显示操作按钮
  showActions: {
    type: [Boolean, null],
    default: null
  },
  actionAlign: {
    type: String as PropType<"start" | "end" | "center" | "space-around" | "space-between" | "space-evenly">,
    default: () => 'start'
  },
  // 自定义按钮文字
  createText: {
    type: String,
    default: '新增'
  },
  updateText: {
    type: String,
    default: '保存'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'validate',
  'success',
  'error',
  'init',
  'field-change',
  'before-submit',
  'after-submit',
  'before-reset',
  'after-reset',
  'cancel' // 添加关闭事件
])

const formRef = ref<InstanceType<typeof NForm> | null>(null)
// 使用一个内部的 ref 来管理表单数据
const internalFormData = ref<Record<string, any>>({})

// 监听 props.modelValue 的变化，同步到内部状态
watch(() => props.modelValue, (newVal) => {
  // 仅当 newVal 发生实际变化时才更新 internalFormData，避免不必要的触发和潜在的循环
  // 使用 JSON.stringify 进行简单深比较，对于复杂对象可能需要更健壮的比较方式
  if (JSON.stringify(internalFormData.value) !== JSON.stringify(newVal)) {
    internalFormData.value = {...newVal}
  }
}, {deep: true, immediate: true}) // immediate: true 确保在组件初始化时同步一次

// 监听内部状态的变化，并向父组件发出更新事件
watch(internalFormData, (newVal, oldVal) => {
  emit('update:modelValue', newVal)

  // 找出变化的字段
  const changedFields = Object.keys(newVal).filter(key =>
      JSON.stringify(newVal[key]) !== JSON.stringify(oldVal?.[key])
  )

  changedFields.forEach(field => {
    emit('field-change', field, newVal[field], newVal)
  })
}, {deep: true})

const loading = ref(false)
const message = useMessage()

const isShowActions = computed(() => {
  if (props.showActions !== null) {
    return props.showActions
  }
  return props.createApi || props.updateApi
})


// 判断是否为编辑模式
const isEdit = computed(() => {
  return !!internalFormData.value.id
})

const formStyle = computed(() => {
  const width = props.width
  if (!width) return {}

  return {
    width: typeof width === 'number' ? `${width}px` : width
  }
})

const defaultExpandedNames = computed(() => {
  if (!processedSchema.value.layout) return []
  // defaultExpandedNames 应该只应用于真正的可收缩分组
  return processedSchema.value.layout
      .filter(item => isFormGroup(item) && item.title && item.collapsible !== false && item.defaultExpanded)
      .map((item, index) => index) as number[]
})

// 类型守卫函数，判断是否为 FormGroup
function isFormGroup(item: FormLayoutItem): item is FormGroup {
  return (item as FormGroup).fields !== undefined;
}

// 获取所有行号
function getRows(fields: FormFieldType[]): number[] {
  const rows = new Set(fields.map(f => f.row || 0))
  return Array.from(rows).sort((a, b) => a - b)
}

// 获取指定行的字段
function getFieldsInRow(fields: FormLayoutItem[], row: number): FormFieldType[] {
  const formFields = fields.filter(f => 'field' in f) as FormFieldType[]
  return formFields.filter(f => (f.row || 0) === row)
}

// 获取分组中的所有行号
function getGroupRows(fields: FormLayoutItem[]): number[] {
  const formFields = fields.filter(f => 'field' in f) as FormFieldType[]
  return getRows(formFields)
}

// 统一处理schema，确保始终有layout属性，并且layout中的每个项都是 FormGroup
const formRules = computed(() => {
  const rules: Record<string, any> = {};
  if (!props.filedSchema) return rules;

  props.filedSchema.forEach(item => {
    if (isFormGroup(item)) {
      item.fields?.forEach(field => {
        if ('field' in field && 'rules' in field && field.rules) {
          rules[field.field] = field.rules;
        }
      });
    } else if ('field' in item && 'rules' in item && item.rules) {
      rules[item.field] = item.rules;
    }
  });
  return rules;
});

const processedSchema = computed(() => {
  if (props.filedSchema) {
    const processedLayout: FormGroup[] = props.filedSchema.map(item => {
      if (isFormGroup(item)) {
        return item;
      } else { // 如果是 FormField，则包装成一个无标题、不可收缩的 FormGroup
        return {
          title: undefined,
          columns: 1, // 默认单列
          fields: [item],
          defaultExpanded: true,
          collapsible: false
        };
      }
    });
    return {
      ...props.filedSchema,
      layout: processedLayout
    };
  }
  return {layout: []}; // 默认返回空布局
});

// 表单验证
const handleValidate = (errors: { [key: string]: string[] }) => {
  emit('validate', errors)
}

// 保存表单
const handleSave = async () => {
  if (!formRef.value) return

  try {
    loading.value = true
    emit('before-submit', internalFormData.value)

    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid) {
      message.error('请检查表单中的错误')
      return
    }

    let result: ServiceResult<Record<string, any>>
    if (isEdit.value) {
      if (!props.updateApi) {
        throw new Error('未配置更新接口')
      }
      result = await props.updateApi(internalFormData.value)
    } else {
      if (!props.createApi) {
        throw new Error('未配置创建接口')
      }
      result = await props.createApi(internalFormData.value)
    }

    if (result.success) {
      message.success(result.message)
      emit('success', result.data)
      emit('after-submit', {isEdit: isEdit.value, formData: internalFormData.value})
      if (!isEdit.value) {
        internalFormData.value = result.data || {} // 创建成功后更新内部数据
      }
    } else {
      message.error(result.message)
      emit('error', new Error(result.message))
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  emit('before-reset', internalFormData.value)

  if (isEdit.value && props.getApi && internalFormData.value?.id) {
    // 编辑模式下，重新获取数据
    loading.value = true
    nextTick(async () => {
      if (props.getApi && (isFunction(props.getApi) || isAsyncFunction(props.getApi))) {
        const result = await props.getApi(internalFormData.value.id);
        if (result.success) {
          internalFormData.value = result.data || {} // 重置为获取到的数据
          message.success('重置成功')
          emit('after-reset', {isEdit: true, formData: internalFormData.value})
        } else {
          message.error(result.message)
        }
        loading.value = false
      } else {
        // 创建模式下，清空表单并应用默认值
        internalFormData.value = {
          ...getDefaultValues(props.filedSchema),
          ...props.modelValue // 确保初始的 prop.modelValue 也能被合并
        }
        formRef.value?.restoreValidation()
        message.success('重置成功')
        emit('after-reset', {isEdit: false, formData: internalFormData.value})
      }
    })

  } else {

  }
}

function setFormData(values: Record<string, any>) {
  Object.keys(values).forEach(key => {
    internalFormData.value[key] = unref(values)[key] || null;
  });
}

function getFormData() {
  return JSON.parse(JSON.stringify(internalFormData.value))
}


const handleCancel = () => {
  emit('cancel')
}

// 初始化数据
onMounted(async () => {
  if (isEdit.value && props.getApi && props.modelValue?.id) {
    try {
      loading.value = true
      const result = await props.getApi(props.modelValue.id)
      if (result.success) {
        internalFormData.value = result.data || {}
        emit('init', {isEdit: true, formData: internalFormData.value})
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取数据失败')
    } finally {
      loading.value = false
    }
  } else {
    // 非编辑模式也初始化默认值
    const defaultValues = getDefaultValues(props.filedSchema)
    internalFormData.value = {
      ...defaultValues,
      ...props.modelValue // 确保初始的 prop.modelValue 也能被合并
    }
    emit('init', {isEdit: false, formData: internalFormData.value})
  }
})


// 暴露方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  restoreValidation: () => formRef.value?.restoreValidation(),
  handleCancel,
  setFormData,
  getFormData
})
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
}

.n-collapse {
  margin-bottom: 16px;
}

.n-form-item.n-form-item--label-placement-top .n-form-item-label {
  text-align: left;
}

.n-form-item .n-form-item-blank {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  margin: 0;
}

.n-form-item-content,
.n-form-item-blank > * {
  text-align: left;
}

.n-form-item .n-input,
.n-form-item .n-select,
.n-form-item .n-date-picker,
.n-form-item .n-switch,
.n-form-item .n-input-number,
.n-form-item .n-checkbox,
.n-form-item .n-radio-group {
  margin-left: 0 !important;
  margin-right: auto !important;
}
</style>
