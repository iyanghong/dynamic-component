export interface ServiceResult<T> {
    code: number;
    success: boolean;
    message: string;
    data: T | null
}


export interface ServicePage<T> {
    pageIndex: number;
    pageSize: number;
    total: number;
    records: T[]
}

export type BaseApiFn<T extends Record<string, any> = any> = ((params: T) => ServiceResult<T>) | ((params: T) => Promise<ServiceResult<T>>)
export type GetApiFn<T extends Record<string, any> = any> = BaseApiFn<T>
export type CreateApiFn<T extends Record<string, any> = any> = BaseApiFn<T>
export type UpdateApiFn<T extends Record<string, any> = any> = BaseApiFn<T>
export type GetAllApiFn<T extends Record<string, any> = any> = BaseApiFn<T>
export type DeleteApiFn<T extends Record<string, any> = any> = BaseApiFn<T>
export type GetPageApiFn<T extends Record<string, any> = any> =
    ((params: T) => ServiceResult<ServicePage<T>>)
    | ((params: T) => Promise<ServiceResult<ServicePage<T>>>)