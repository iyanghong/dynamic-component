<template>
  <div class="dynamic-form">
    <n-form 
      ref="formRef"
      :model="modelValue" 
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
                      <form-field :field="{ ...field, inGroup: true }" v-model="modelValue[field.field]" />
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
                    <form-field :field="{ ...field, inGroup: true }" v-model="modelValue[field.field]" />
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
                    <form-field :field="{ ...field, inGroup: true }" v-model="modelValue[field.field]" />
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
      <n-space>
        <n-button 
          type="primary" 
          @click="handleSave"
          :loading="loading"
        >
          {{ isEdit ? '保存' : '新增' }}
        </n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { NForm, NFormItem, NGrid, NGi, NCollapse, NCollapseItem, NCard, NSpace, NButton, useMessage } from 'naive-ui'
import FormField from './FormField.vue'
import type { FormSchema, FormField as FormFieldType, FormGroup, FormLayoutItem } from './types'
import { ServiceResult } from '@/types/response'

const props = defineProps({
  schema: {
    type: Object as () => FormSchema,
    required: true,
    validator: (value: FormSchema) => {
      return !!value?.layout;
    }
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
    type: Function as () => Promise<ServiceResult<any>>,
    default: undefined
  },
  createApi: {
    type: Function as () => Promise<ServiceResult<any>>,
    default: undefined
  },
  updateApi: {
    type: Function as () => Promise<ServiceResult<any>>,
    default: undefined
  },
  // 是否显示操作按钮
  showActions: {
    type: [Boolean , null],
    default: null
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

const emit = defineEmits(['update:modelValue', 'validate', 'success', 'error'])

const formRef = ref<InstanceType<typeof NForm> | null>(null)
const modelValue = ref({ ...props.modelValue })
const loading = ref(false)
const message = useMessage()
const globalError = ref('')
const isShowActions = computed(() => {
  if (props.showActions !== null){
    return props.showActions
  }
  return props.createApi || props.updateApi
})





// 判断是否为编辑模式
const isEdit = computed(() => {
  return !!modelValue.value.id
})

const formStyle = computed(() => {
  const width = props.schema.width
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
function getFieldsInRow(fields: FormFieldType[], row: number): FormFieldType[] {
  return fields.filter(f => (f.row || 0) === row)
}

// 获取分组中的所有行号
function getGroupRows(fields: FormFieldType[]): number[] {
  return getRows(fields)
}

// 统一处理schema，确保始终有layout属性，并且layout中的每个项都是 FormGroup
const formRules = computed(() => {
  const rules: Record<string, any> = {};
  if (!props.schema.layout) return rules;

  props.schema.layout.forEach(group => {
    if (isFormGroup(group)) {
      group.fields?.forEach(field => {
        if (field.field && field.rules) {
          rules[field.field] = field.rules;
        }
      });
    }
  });
  return rules;
});

const processedSchema = computed(() => {
  if (props.schema.layout) {
    const processedLayout: FormGroup[] = props.schema.layout.map(item => {
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
      ...props.schema,
      layout: processedLayout
    };
  }
  return { layout: [] }; // 默认返回空布局
});

watch(modelValue, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 表单验证
const handleValidate = (errors: { [key: string]: string[] }) => {
  emit('validate', errors)
}

// 保存表单
const handleSave = async () => {
  if (!formRef.value) return

  try {
    loading.value = true
    
    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid) {
      message.error('请检查表单中的错误')
      return
    }

    let result: ServiceResult<any>
    if (isEdit.value) {
      if (!props.updateApi) {
        throw new Error('未配置更新接口')
      }
      result = await props.updateApi(modelValue.value)
    } else {
      if (!props.createApi) {
        throw new Error('未配置创建接口')
      }
      result = await props.createApi(modelValue.value)
    }

    if (result.success) {
      message.success(result.message)
      emit('success', result.data)
      if (!isEdit.value) {
        modelValue.value = result.data
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
  if (isEdit.value && props.getApi) {
    // 编辑模式下，重新获取数据
    loading.value = true
    props.getApi()
      .then(result => {
        if (result.success) {
          modelValue.value = result.data
          message.success('重置成功')
        } else {
          message.error(result.message)
        }
      })
      .catch(error => {
        message.error(error instanceof Error ? error.message : '重置失败')
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    // 创建模式下，清空表单
    modelValue.value = {}
    formRef.value?.restoreValidation()
    message.success('重置成功')
  }
}

// 初始化数据
onMounted(async () => {
  if (isEdit.value && props.getApi) {
    try {
      loading.value = true
      const result = await props.getApi()
      if (result.success) {
        modelValue.value = result.data
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取数据失败')
    } finally {
      loading.value = false
    }
  }
})

// 暴露方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  restoreValidation: () => formRef.value?.restoreValidation()
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
