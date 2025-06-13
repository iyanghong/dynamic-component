import type { FormSchema, FormField } from './types'
import { ServiceResult } from '@/types/response'
import { validateField } from './utils'

export interface FormApiOptions<T = any> {
  // API 配置
  getApi?: () => Promise<ServiceResult<T>>
  createApi?: (data: T) => Promise<ServiceResult<T>>
  updateApi?: (data: T) => Promise<ServiceResult<T>>
  deleteApi?: (id: string | number) => Promise<ServiceResult<T>>
  // 固定数据（当不需要调用 API 时使用）
  fixedData?: T
  // 表单配置
  schema: FormSchema
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

export class FormApi<T = any> {
  private options: FormApiOptions<T>
  private formData: T
  private originalData: T | null = null
  private isDirty: boolean = false
  private validationErrors: Record<string, string[]> = {}
  private formRef: any

  constructor(options: FormApiOptions<T>) {
    this.options = options
    this.formData = {} as T
  }

  setFormRef(formRef: any) {
    this.formRef = formRef
  }

  // 获取表单数据
  async getData(): Promise<ServiceResult<T>> {
    try {
      if (this.options.fixedData) {
        return new ServiceResult<T>().ofSuccess('获取成功', this.options.fixedData)
      }

      if (this.options.getApi) {
        const result = await this.options.getApi()
        if (result.success) {
          this.options.onSuccess?.(result)
        } else {
          this.options.onError?.(new Error(result.message))
        }
        return result
      }

      return new ServiceResult<T>().ofFaild('未配置获取数据接口', null as any)
    } catch (error) {
      this.options.onError?.(error)
      return new ServiceResult<T>().ofFaild(error instanceof Error ? error.message : '获取数据失败', null as any)
    }
  }

  // 创建数据
  async create(data: T): Promise<ServiceResult<T>> {
    try {
      // 表单验证
      if (this.options.validateBeforeSubmit) {
        const errors = await this.validateForm()
        if (errors) {
          this.options.onValidationError?.(errors)
          return new ServiceResult<T>().ofFaild('表单验证失败', null as any)
        }
      }

      // 执行表单提交前回调
      if (this.options.onFormSubmit && !(await this.options.onFormSubmit(data))) {
        return new ServiceResult<T>().ofFaild('表单提交被取消', null as any)
      }

      // 执行创建前回调
      if (this.options.onBeforeCreate && !(await this.options.onBeforeCreate(data))) {
        return new ServiceResult<T>().ofFaild('创建操作被取消', null as any)
      }

      if (this.options.createApi) {
        const result = await this.options.createApi(data)
        if (result.success) {
          this.handleCreateSuccess(result.data as T)
          return result
        } else {
          this.handleError(new Error(result.message))
          return result
        }
      }

      return new ServiceResult<T>().ofFaild('未配置创建数据接口', null as any)
    } catch (error) {
      this.handleError(error)
      return new ServiceResult<T>().ofFaild(error instanceof Error ? error.message : '创建数据失败', null as any)
    }
  }

  // 更新数据
  async update(data: T): Promise<ServiceResult<T>> {
    try {
      // 表单验证
      if (this.options.validateBeforeSubmit) {
        const errors = await this.validateForm()
        if (errors) {
          this.options.onValidationError?.(errors)
          return new ServiceResult<T>().ofFaild('表单验证失败', null as any)
        }
      }

      // 执行表单提交前回调
      if (this.options.onFormSubmit && !(await this.options.onFormSubmit(data))) {
        return new ServiceResult<T>().ofFaild('表单提交被取消', null as any)
      }

      // 执行更新前回调
      if (this.options.onBeforeUpdate && !(await this.options.onBeforeUpdate(data))) {
        return new ServiceResult<T>().ofFaild('更新操作被取消', null as any)
      }

      if (this.options.updateApi) {
        const result = await this.options.updateApi(data)
        if (result.success) {
          this.handleUpdateSuccess(result.data as T)
          return result
        } else {
          this.handleError(new Error(result.message))
          return result
        }
      }

      return new ServiceResult<T>().ofFaild('未配置更新数据接口', null as any)
    } catch (error) {
      this.handleError(error)
      return new ServiceResult<T>().ofFaild(error instanceof Error ? error.message : '更新数据失败', null as any)
    }
  }

  // 删除数据
  async delete(id: string | number): Promise<ServiceResult<T>> {
    try {
      // 执行删除前回调
      if (this.options.onBeforeDelete && !(await this.options.onBeforeDelete(id))) {
        return new ServiceResult<T>().ofFaild('删除操作被取消', null as any)
      }

      if (!this.options.deleteApi) {
        throw new Error('deleteApi is not provided')
      }

      const result = await this.options.deleteApi(id)
      if (result.success) {
        this.handleDeleteSuccess()
      }
      return result
    } catch (error) {
      this.handleError(error)
      return new ServiceResult<T>().ofFaild(
        error instanceof Error ? error.message : '删除失败',
        null as any
      )
    }
  }

  // 表单验证
  private async validateForm(): Promise<{ [key: string]: string[] } | null> {
    if (!this.formRef) {
      console.warn('Form reference not set')
      return null
    }

    try {
      const errors = await this.formRef.validate()
      if (errors && Object.keys(errors).length > 0) {
        this.validationErrors = errors
        this.options.onValidationError?.(errors)
      }
      return errors
    } catch (error) {
      console.error('Form validation error:', error)
      return null
    }
  }

  // 验证单个字段
  validateField(field: string, value: any): boolean {
    const allFields: FormField[] = []
    this.options.schema.layout?.forEach(item => {
      if ('fields' in item) {
        allFields.push(...item.fields)
      } else {
        allFields.push(item)
      }
    })

    const fieldConfig = allFields.find(f => f.field === field)
    if (!fieldConfig) return true

    const fieldErrors: string[] = []
    let isValid = true

    if (fieldConfig.rules) {
      fieldConfig.rules.forEach(rule => {
        if (rule.required && !value) {
          fieldErrors.push(rule.message || '此字段为必填项')
          isValid = false
        }
        if (rule.validator && !rule.validator(value)) {
          fieldErrors.push(rule.message || '验证失败')
          isValid = false
        }
      })
    }

    if (fieldErrors.length > 0) {
      this.validationErrors[field] = fieldErrors
      this.options.onValidationError?.(this.validationErrors)
    } else {
      delete this.validationErrors[field]
    }

    return isValid
  }

  // 更新字段值
  updateField(field: string, value: any) {
    this.formData[field as keyof T] = value
    this.isDirty = true

    if (this.options.validateOnChange) {
      this.validateField(field, value)
    }

    this.options.onFieldChange?.(field, value, this.formData)
  }

  // 重置表单
  reset() {
    this.formData = this.originalData ? { ...this.originalData } : {} as T
    this.isDirty = false
    this.validationErrors = {}
    this.options.onFormReset?.()
  }

  // 获取当前表单数据
  getFormData(): T {
    return this.formData
  }

  // 设置表单数据
  setFormData(data: T) {
    this.formData = data
    this.originalData = { ...data }
    this.isDirty = false
  }

  // 获取验证错误
  getValidationErrors(): Record<string, string[]> {
    return this.validationErrors
  }

  // 检查表单是否被修改
  isFormDirty(): boolean {
    return this.isDirty
  }

  // 私有方法：处理获取成功
  private handleGetSuccess(data: T) {
    this.formData = data
    this.originalData = { ...data }
    this.isDirty = false
    this.options.onAfterGet?.(data)
    this.options.onSuccess?.(new ServiceResult<T>().ofSuccess('获取成功', data))
  }

  // 私有方法：处理创建成功
  private handleCreateSuccess(data: T) {
    this.formData = data
    this.originalData = { ...data }
    this.isDirty = false
    this.options.onAfterCreate?.(data)
    this.options.onFormSubmitSuccess?.(data)
    this.options.onSuccess?.(new ServiceResult<T>().ofSuccess('创建成功', data))
  }

  // 私有方法：处理更新成功
  private handleUpdateSuccess(data: T) {
    this.formData = data
    this.originalData = { ...data }
    this.isDirty = false
    this.options.onAfterUpdate?.(data)
    this.options.onFormSubmitSuccess?.(data)
    this.options.onSuccess?.(new ServiceResult<T>().ofSuccess('更新成功', data))
  }

  // 私有方法：处理删除成功
  private handleDeleteSuccess() {
    this.formData = {} as T
    this.originalData = null
    this.isDirty = false
    this.options.onAfterDelete?.()
    this.options.onSuccess?.(new ServiceResult<T>().ofSuccess('删除成功', null as any))
  }

  // 私有方法：处理错误
  private handleError(error: any) {
    this.options.onError?.(error)
    this.options.onFormSubmitError?.(error)
  }
} 