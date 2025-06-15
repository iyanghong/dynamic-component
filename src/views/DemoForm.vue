<template>
  <n-card title="分组表单" style="margin-top: 20px;">
    <DynamicForm :filedSchema="groupSchema" v-model="groupFormData"/>
  </n-card>

  <n-card title="多列布局" style="margin-top: 20px;">
    <DynamicForm :filedSchema="layoutSchema" v-model="layoutFormData"/>
  </n-card>

  <n-card title="不可收缩分组" style="margin-top: 20px;">
    <DynamicForm :filedSchema="nonCollapsibleSchema" v-model="nonCollapsibleFormData"/>
  </n-card>

  <n-card title="混合分组与非分组" style="margin-top: 20px;">
    <DynamicForm :filedSchema="mixedSchema" v-model="mixedFormData"/>
  </n-card>

  <n-card title="全面布局示例" style="margin-top: 20px;">
    <DynamicForm :filedSchema="demoLayoutSchema" v-model="demoLayoutFormData"/>
  </n-card>

  <n-card title="表单 API 示例" style="margin-top: 20px;">
    <DynamicForm
        :filedSchema="apiFormSchema"
        v-model="apiFormData"
        :get-api="mockGetApi"
        :create-api="mockCreateApi"
        :update-api="mockUpdateApi"
        @success="handleSuccess"
        @error="handleError"
    />
  </n-card>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import {ServiceResult} from '@/types/response-utils.ts'
import {NCard, useMessage} from "naive-ui";
import DynamicForm from "@/components/DynamicComponent/DynamicForm/DynamicForm.vue";
import type {FormFieldSchema} from "@/components/DynamicComponent/DynamicForm/types.ts";
// 表单示例数据
const groupFormData = ref({})
const groupSchema: FormFieldSchema = [
  {
    title: '基本信息',
    defaultExpanded: true,
    columns: 2,
    fields: [
      {type: 'input', label: '姓名', field: 'name', width: '80%', row: 0, defaultValue: '张三'},
      {
        type: 'select', label: '性别', field: 'gender',
        options: [
          {label: '男', value: 'male'},
          {label: '女', value: 'female'}
        ],
        width: '150px',
        row: 0
      },
      {
        type: 'input', label: '手机', field: 'phone', row: 1, defaultValue: () => {
          return '18866666666'
        }
      },
      {type: 'input', label: '邮箱', field: 'email', row: 1}
    ]
  },
  {
    title: '其他信息',
    defaultExpanded: false,
    columns: 3,
    fields: [
      {type: 'date', label: '出生日期', field: 'birthday', row: 0},
      {
        type: 'select', label: '学历', field: 'education',
        options: [
          {label: '高中', value: 'high'},
          {label: '本科', value: 'bachelor'},
          {label: '硕士', value: 'master'}
        ],
        row: 0
      },
      {type: 'switch', label: '是否在职', field: 'employed', row: 0},
      {type: 'input', label: '备注', field: 'remark', span: 3, row: 1, labelPosition: 'top'}
    ]
  }
]

const layoutFormData = ref({})
const layoutSchema: FormFieldSchema = [
  {
    columns: 3,
    fields: [
      {type: 'input', label: '字段1', field: 'field1', span: 1, width: '100px', row: 0},
      {type: 'input', label: '字段2', field: 'field2', span: 2, width: '90%', row: 0},
      {type: 'input', label: '字段3', field: 'field3', span: 3, row: 1, labelPosition: 'top'}
    ]
  }
]

const nonCollapsibleFormData = ref({});
const nonCollapsibleSchema: FormFieldSchema = [
  {
    title: '不可收缩分组',
    collapsible: false,
    fields: [
      {type: 'input', label: '字段A', field: 'fieldA', row: 0},
      {type: 'input', label: '字段B', field: 'fieldB', row: 1}
    ]
  }
];

const mixedFormData = ref({});
const mixedSchema: FormFieldSchema = [
  {
    // 非分组字段块
    collapsible: false,
    fields: [
      {type: 'input', label: '非分组字段1', field: 'nonGroupedField1', row: 0},
      {type: 'input', label: '非分组字段2', field: 'nonGroupedField2', row: 0},
    ]
  },
  {
    title: '混合分组 - 基本信息',
    defaultExpanded: true,
    columns: 2,
    fields: [
      {type: 'input', label: '姓名', field: 'mixedName', row: 0},
      {
        type: 'select', label: '性别', field: 'mixedGender',
        options: [
          {label: '男', value: 'male'},
          {label: '女', value: 'female'}
        ],
        row: 0
      },
    ]
  },
  {
    title: '混合分组 - 联系方式',
    collapsible: false,
    fields: [
      {type: 'input', label: '邮箱', field: 'mixedEmail', row: 0},
      {type: 'input', label: '电话', field: 'mixedPhone', row: 0},
    ]
  },
  {
    // 另一个非分组字段块
    collapsible: false,
    fields: [
      {type: 'input', label: '非分组字段3', field: 'nonGroupedField3', row: 0, span: 2},
    ]
  }
];

const demoLayoutFormData = ref({});
const demoLayoutSchema: FormFieldSchema = [
  // 顶部直接显示的字段，无分组
  {type: 'input', label: '个人简介', field: 'profile', span: 3, row: 0, labelPosition: 'top'},
  {
    // 一个普通的、默认展开的两列分组
    title: '账户信息',
    columns: 2,
    defaultExpanded: true,
    fields: [
      {type: 'input', label: '用户名', field: 'username', row: 0, width: '200px'},
      {type: 'password', label: '密码', field: 'password', row: 0, width: '200px'},
      {type: 'input', label: '邮箱', field: 'email', row: 1, span: 2, labelPosition: 'left'},
    ]
  },
  // 带有标题但不可收缩的分组（显示为卡片）
  {
    title: '个人偏好',
    collapsible: false,
    columns: 3,
    fields: [
      {type: 'checkbox', label: '接收邮件通知', field: 'emailNotify', row: 0},
      {type: 'switch', label: '启用深色模式', field: 'darkMode', row: 0},
      {type: 'number', label: '每页显示', field: 'itemsPerPage', row: 0, defaultValue: 10, width: '120px'},
    ]
  },
  // 无标题、不可收缩的多列字段块
  {
    collapsible: false, // 明确指出不可收缩
    columns: 2,
    fields: [
      {type: 'date', label: '注册日期', field: 'registerDate', row: 0, width: '180px'},
      {
        type: 'select', label: '所在地区', field: 'region',
        options: [
          {label: '北京', value: 'beijing'},
          {label: '上海', value: 'shanghai'},
          {label: '广州', value: 'guangzhou'}
        ],
        row: 0,
        width: '180px'
      },
    ]
  },
  // 另一个直接显示的字段
  {type: 'input', label: '备注', field: 'notes', span: 3, row: 0, labelPosition: 'top'},
];


// API 表单示例
const message = useMessage()
const apiFormData = ref({})

const apiFormSchema = [
  {
    title: '用户信息',
    columns: 2,
    fields: [
      {
        type: 'input',
        label: '用户名',
        field: 'username',
        rules: [
          {required: true, message: '请输入用户名', trigger: ['input', 'blur', 'change']}
        ]
      },
      {
        type: 'input',
        label: '邮箱',
        field: 'email',
        rules: [
          {required: true, message: '请输入邮箱', trigger: ['input', 'blur', 'change']},
          {
            pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
            message: '请输入有效的邮箱地址',
            trigger: ['input', 'blur', 'change']
          }
        ]
      },
      {
        type: 'select',
        label: '角色',
        field: 'role',
        options: [
          {label: '管理员', value: 'admin'},
          {label: '用户', value: 'user'}
        ],
        rules: [
          {required: true, message: '请选择角色', trigger: ['blur', 'change']}
        ]
      }
    ]
  }
]

// 模拟 API 调用
const mockGetApi = () => {
  return new Promise<ServiceResult<any>>((resolve) => {
    setTimeout(() => {
      resolve(new ServiceResult().ofSuccess('获取成功', {
        id: 1,
        username: 'test_user',
        email: 'test@example.com',
        role: 'user'
      }))
    }, 1000)
  })
}

const mockCreateApi = (data: any) => {
  return new Promise<ServiceResult<any>>((resolve) => {
    setTimeout(() => {
      resolve(new ServiceResult().ofSuccess('创建成功', {
        ...data,
        id: Date.now() // 模拟生成ID
      }))
    }, 1000)
  })
}

const mockUpdateApi = (data: any) => {
  return new Promise<ServiceResult<any>>((resolve) => {
    setTimeout(() => {
      resolve(new ServiceResult().ofSuccess('更新成功', data))
    }, 1000)
  })
}

// 处理成功回调
const handleSuccess = (data: any) => {
  console.log('操作成功:', data)
}

// 处理错误回调
const handleError = (error: Error) => {
  console.error('操作失败:', error)
}
</script>


<style scoped>

</style>