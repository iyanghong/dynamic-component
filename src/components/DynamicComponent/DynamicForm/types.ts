export interface FormSchema {
  layout?: FormLayoutItem[]
  width?: string | number // 表单宽度，可以是数字(px)或字符串(如'100%')
}

export type FormLayoutItem = FormField | FormGroup;

export interface FormField {
  type: 'input' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'switch' | 'number'
  label: string
  field: string
  defaultValue?: any
  rules?: Array<{
    required?: boolean
    message?: string
    validator?: Function
  }>
  options?: Array<{
    label: string
    value: any
  }>
  span?: number
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  filterable?: boolean
  inGroup?: boolean
  width?: string | number // 字段宽度，可以是数字(px)或字符串(如'100%')
  labelPosition?: 'left' | 'top' // 标签位置，默认left
  row?: number // 所在行号，相同row的字段会在同一行显示
}

export interface FormGroup {
  title?: string
  columns?: number
  fields: FormField[]
  defaultExpanded?: boolean
  collapsible?: boolean // 新增：是否可收缩，默认true
}
