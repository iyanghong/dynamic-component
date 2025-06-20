import type {FormField, FormGroup, FormLayoutItem} from './types'

// 类型守卫函数，判断是否为 FormGroup
function isFormGroup(item: FormLayoutItem): item is FormGroup {
    return (item as FormGroup).fields !== undefined;
}

export function getDefaultValues(schema: FormLayoutItem[]) {
    const allFields: FormField[] = [];
    if (schema) {
        schema.forEach(item => {
            if (isFormGroup(item)) {
                allFields.push(...item.fields.filter(f => 'field' in f));
            } else if ('field' in item) { // FormField
                allFields.push(item);
            }
        });
    }

    return allFields.reduce((model: Record<string, any>, field: FormField) => {
        if (field.defaultValue !== undefined) {
            if (typeof field.defaultValue === 'function') {
                model[field.field] = field.defaultValue({});
            } else {
                model[field.field] = field.defaultValue;
            }
        } else {
            model[field.field] = null;
        }
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
