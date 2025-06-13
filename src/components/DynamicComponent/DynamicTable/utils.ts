import type { TableColumn, TableConfig } from './types'
import type { DataTableColumn } from 'naive-ui'

export function initTableColumns(config: TableConfig): DataTableColumn[] {
  return config.map(column => ({
    key: column.key,
    title: column.title,
    render: column.render || getDefaultRenderer(column.type, column.key),
    ...column.props
  }))
}

function getDefaultRenderer(type?: string, key?: string): (rowData: any) => any {
  const rendererMap: Record<string, (rowData: any) => any> = {
    date: (rowData) => new Date(rowData[key as string]).toLocaleDateString(),
    boolean: (rowData) => rowData[key as string] ? '是' : '否',
    // 可以继续添加其他类型渲染器
  }
  return rendererMap[type as string] || ((rowData) => rowData[key as string])
}
