import {ServiceResult} from "@/types/response-utils.ts";
import type {GetApiFn, CreateApiFn, UpdateApiFn, DeleteApiFn} from '@/types/response'

export interface FormProps<T extends Record<string, any> = any> {
    // API 配置
    getApi?: GetApiFn<T>
    createApi?: CreateApiFn<T>
    updateApi?: UpdateApiFn<T>
    deleteApi?: DeleteApiFn<T>
    // 固定数据（当不需要调用 API 时使用）
    fixedData?: T
    // 表单配置
    filedSchema: FormFieldSchema<T>
    actionAlign?: "start" | "end" | "center" | "space-around" | "space-between" | "space-evenly"
    width?: string | number // 表单宽度，可以是数字(px)或字符串(如'100%')
    // 验证配置
    validateBeforeSubmit?: boolean // 是否在提交前验证
    validateOnChange?: boolean // 是否在值变化时验证
    // 回调钩子
    onSuccess?: (result: ServiceResult<T>) => void // 成功回调
    onError?: (error: any) => void // 错误回调
    onBeforeGet?: () => Promise<boolean> // 获取数据前回调
    onAfterGet?: (data: T) => void // 获取数据后回调
    onBeforeCreate?: (data: T) => Promise<boolean> // 创建数据前回调
    onAfterCreate?: (data: T) => void // 创建数据后回调
    onBeforeUpdate?: (data: T) => Promise<boolean> // 更新数据前回调
    onAfterUpdate?: (data: T) => void // 更新数据后回调
    onBeforeDelete?: (id: string | number) => Promise<boolean> // 删除数据前回调
    onAfterDelete?: () => void // 删除数据后回调
    onFieldChange?: (field: string, value: any, formData: T) => void // 字段值变化回调
    onValidationError?: (errors: Record<string, string[]>) => void // 验证错误回调
    onFormReset?: () => void // 表单重置回调
    onFormSubmit?: (data: T) => Promise<boolean> // 表单提交前回调
    onFormSubmitSuccess?: (data: T) => void // 表单提交成功回调
    onFormSubmitError?: (error: any) => void // 表单提交失败回调
}

export interface FormPopupProps {
    title?: string;
    width?: number | string;
    mode?: 'modal' | 'drawer';
    placement?: 'top' | 'right' | 'bottom' | 'left';
    formProp: FormProps

    [key: string]: any;
}

export type FormSchema<T extends Record<string, any> = any> = FormLayoutItem<T> [];
export type FormFieldSchema<T extends Record<string, any> = any> = FormSchema<T>;
export type FormLayoutItem<T extends Record<string, any> = any> = FormField<T> | FormGroup<T>;

export interface FormField<T extends Record<string, any> = any> {
    type: 'input' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'switch' | 'number'
    label: string
    field: string
    showInSimple?: boolean // 是否在简单搜索中显示
    hidden?: boolean; // 是否默认隐藏，需要点击高级搜索才显示
    defaultValue?: (formData: T) => any | any
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
    row?: number // 所在行号，相同row的字段会在同一行显示，默认0
    setValueFormatter?: (value: any, formData: T) => any
    getValueFormatter?: (value: any, formData: T) => any
}

export interface FormGroup<T extends Record<string, any> = any> {
    title?: string
    columns?: number
    fields: FormLayoutItem<T>[]
    defaultExpanded?: boolean
    collapsible?: boolean // 新增：是否可收缩，默认true
}
