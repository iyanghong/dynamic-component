import type { FormSchema, FormField, FormGroup, FormLayoutItem } from './types'

// 类型守卫函数，判断是否为 FormGroup
function isFormGroup(item: FormLayoutItem): item is FormGroup {
  return (item as FormGroup).fields !== undefined;
}

export function getDefaultValues(schema: FormSchema) {
  const allFields: FormField[] = [];
  if (schema.layout) {
    schema.layout.forEach(item => {
      if (isFormGroup(item)) {
        allFields.push(...item.fields);
      } else { // FormField
        allFields.push(item);
      }
    });
  }

  return allFields.reduce((model: Record<string, any>, field: FormField) => {
    model[field.field] = field.defaultValue ?? '';
    return model;
  }, {} as Record<string, any>);
}

export function validateField(
  model: Record<string, any>,
  field: FormField
): boolean {
  if (!field.rules) return true
  return field.rules.every(rule => {
    if (rule.required && !model[field.field]) {
      return false
    }
    if (rule.validator && !(rule.validator as Function)(model[field.field])) {
      return false
    }
    return true
  })
}
