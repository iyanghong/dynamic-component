export class ServiceResult<T> {
    code: number = 0;
    success: boolean = true;
    message: string = "";
    data: T | null = null

    constructor() {
    }

    set(code: number, message: string, data: T | null) {
        this.code = code;
        this.success = code == 0
        this.message = message;
        this.data = data;
        return this
    }

    ofSuccess(message: string, data: T) {
        this.code = 0;
        this.success = true;
        this.data = data;
        this.message = message;
        return this
    }

    ofFaild(message: string, data: T) {
        this.code = 1;
        this.success = false;
        this.data = data;
        this.message = message;
        return this
    }
}


export class ServicePage<T> {
    pageIndex: number = 1;
    pageSize: number = 10;
    total: number = 0;
    records: T[] = []
}
