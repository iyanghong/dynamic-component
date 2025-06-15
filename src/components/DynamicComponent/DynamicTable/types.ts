import type { DataTableColumn } from 'naive-ui'
import { ServiceResult, ServicePage } from '@/types/response-utils.ts'
import type { FormField } from "@/components/DynamicComponent/DynamicForm/types";

export interface TableColumn {
  key: string
  title: string
  type?: string
  render?: (rowData: any) => any
  props?: Record<string, any>
  buttons?: TableButton[]   // 新增操作列按钮
}

export type TableConfig = TableColumn[]

// 新增操作按钮接口
export interface TableButton {
  text: string;
  type?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  onClick: (row: any) => void;
}

// 新增表格属性接口
export interface TableProps {
  pagination?: boolean;
  pageSize?: number;
  getPageApi?: (param: any) => Promise<ServiceResult<ServicePage<any>>>;
  getAllApi?: (param: any) => Promise<ServiceResult<any[]>>;
  deleteApi?: (row: any) => Promise<ServiceResult<boolean>>;

  
  // 搜索相关配置
  searchFields?: FormField[];
  showAdvancedSearch?: boolean;
  showSearchButton?: boolean;
  showResetButton?: boolean;

  // 表单相关配置
  formSchema?: FormField[];  // 表单字段配置
  createApi?: (data: any) => Promise<ServiceResult<any>>; // 创建接口
  updateApi?: (data: any) => Promise<ServiceResult<any>>; // 更新接口
  getApi?: (id: string) => Promise<ServiceResult<Record<string, any>>>; // 新增获取单条数据接口
}
