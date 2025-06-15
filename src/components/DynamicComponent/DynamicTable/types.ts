import type { FormField } from "@/components/DynamicComponent/DynamicForm/types";
import type { 
  CreateApiFn, 
  DeleteApiFn, 
  GetAllApiFn, 
  GetApiFn, 
  GetPageApiFn, 
  UpdateApiFn 
} from "@/types/response";
import type { NButton, DataTableProps } from "naive-ui";
import type { Component, VNodeChild } from 'vue';
import type { Type } from 'naive-ui/es/button/src/interface';

/** 表格行数据类型 */
export type RowData<T = Record<string, unknown>> = T;

/** 
 * 表格列配置
 * @template T - 行数据类型
 */
export interface TableColumn<T extends RowData = RowData> {
  /** 列的唯一标识 */
  key: keyof T | string;
  /** 列标题 */
  title: string;
  /** 列类型（可选） */
  type?: string;
  /** 
   * 自定义渲染函数
   * @param rowData - 当前行数据
   * @param index - 行索引
   * @returns 渲染内容
   */
  render?: (rowData: T, index: number) => VNodeChild;
  /** 列额外属性 */
  props?: Record<string, unknown>;
  /** 列宽度 */
  width?: number | string;
  /** 列对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否可排序 */
  sorter?: boolean | ((a: T, b: T) => number);
  /** 过滤配置 */
  filter?: {
    options: Array<{ label: string; value: any }>;
    multiple?: boolean;
  };
  /** 
   * 是否显示列的条件
   * @param row - 行数据
   * @param index - 行索引
   */
  ifShow?: boolean | ((row: T, index: number) => boolean);
}

/** 表格操作按钮配置 */
export interface TableAction<T extends RowData = RowData> {
  /** 按钮文本 */
  text: string;
  /** 按钮类型 */
  type?: Type;
  /** 
   * 点击事件处理
   * @param row - 关联的行数据
   * @param index - 行索引
   */
  onClick: (row: T, index: number) => void;
  /** 
   * 是否显示按钮的条件
   * @param row - 行数据
   * @param index - 行索引
   */
  ifShow?: boolean | ((row: T, index: number) => boolean);
}

/** 表格属性配置 */
export interface TableProps<T extends RowData = RowData> {
  /** 是否启用分页 */
  pagination?: boolean | DataTableProps['pagination'];
  /** 每页数据量 */
  pageSize?: number;
  /** 分页数据获取API */
  getPageApi?: GetPageApiFn<T>;
  /** 全量数据获取API */
  getAllApi?: GetAllApiFn<T>;
  /** 删除API */
  deleteApi?: DeleteApiFn<T>;
  /** 搜索字段配置 */
  searchFields?: FormField[];
  /** 是否显示高级搜索 */
  showAdvancedSearch?: boolean;
  /** 是否显示搜索按钮 */
  showSearchButton?: boolean;
  /** 是否显示重置按钮 */
  showResetButton?: boolean;
  /** 搜索参数 */
  searchParams?: TableSearchParams;
  /** 是否显示数据总数 */
  showTotal?: boolean;
  /** 表格数据 */
  data?: T[];
  /** 表单字段配置 */
  formSchema?: FormField[];
  /** 创建数据API */
  createApi?: CreateApiFn<T>;
  /** 更新数据API */
  updateApi?: UpdateApiFn<T>;
  /** 获取单条数据API */
  getApi?: GetApiFn<T>;
  /** 
   * 操作列配置
   * 支持预定义操作按钮：view（查看）、edit（编辑）、delete（删除）
   * 支持自定义操作按钮
   */
  actions?: Array<'view' | 'edit' | 'delete'> | TableAction<T>[];
  /** 表头操作区配置 */
  headerActions?: (methods: TableMethods<T>) => TableAction[];
  /** 行选择事件 */
  onCheckedRows?: (keys: string[]) => void;
  /** 是否启用虚拟滚动 */
  virtualScroll?: boolean;
  /** 虚拟滚动配置 */
  virtualScrollOptions?: {
    /** 行高 */
    itemSize?: number;
    /** 缓冲区大小 */
    overscan?: number;
  };
  /** 
   * API错误处理函数
   * @param error - 错误对象
   * @param type - API类型（'get' | 'create' | 'update' | 'delete'）
   */
  onApiError?: (error: unknown, type: 'get' | 'create' | 'update' | 'delete') => void;
}

/** 表格搜索参数 */
export interface TableSearchParams {
  /** 当前页码 */
  pageNumber: number;
  /** 每页数据量 */
  pageSize: number;
  /** 扩展参数 */
  [key: string]: unknown;
}

/** 表格列配置类型 */
export type TableConfig<T extends RowData = RowData> = TableColumn<T>[];

/** 表格操作方法 */
export interface TableMethods<T extends RowData = RowData> {
  /** 更新搜索参数 */
  updateSearchParams: (params: Partial<TableSearchParams>) => void;
  /** 获取过滤表单数据 */
  getFilterFormData: (otherParams?: Record<string, unknown>) => TableSearchParams;
  /** 加载表格数据 */
  getData: (otherParams?: Record<string, unknown>) => Promise<void>;
  /** 打开表单 */
  handleOpenForm: (record?: T) => void;
  /** 刷新表格 */
  handleRefresh: () => void;
  /** 执行搜索 */
  handleSearch: (params: Record<string, unknown>) => void;
  /** 提交表单 */
  handleSubmitForm: (formData: Record<string, unknown>) => void;
  /** 删除数据 */
  handleDelete: (record: T) => void;
  /** 设置选中行keys */
  setCheckedRowKeys: (keys: string[]) => void;
  /** 获取选中行keys */
  getCheckedRowKeys: () => string[];
  /** 排序处理 */
  handleSorterChange: (sorter: { columnKey: string; order: 'ascend' | 'descend' | false }) => void;
  /** 过滤处理 */
  handleFilterChange: (filters: Record<string, any[]>) => void;
}
