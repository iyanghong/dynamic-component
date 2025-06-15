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

export type BaseApiFun<T> = ((params: T) => ServiceResult<T>) | ((params: T) => Promise<ServiceResult<T>>)
export type GetApiFun<T> = BaseApi<T>
export type CreateApiFun<T> = BaseApi<T>
export type UpdateApiFun<T> = BaseApi<T>
export type GetAllApiFun<T> = BaseApi<T>
export type DeleteApiFun<T> = BaseApi<T>
export type GetPageApiFun<T> =
    ((params: T) => ServiceResult<ServicePage<T>>)
    | ((params: T) => Promise<ServiceResult<ServicePage<T>>>)