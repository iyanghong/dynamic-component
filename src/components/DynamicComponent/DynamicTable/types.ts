import type { DataTableColumn } from 'naive-ui'

export interface TableColumn {
  key: string
  title: string
  type?: string
  render?: (rowData: any) => any
  props?: Record<string, any>
}

export type TableConfig = TableColumn[]
