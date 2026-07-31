import { IColumn, IRecordSaveOperationResult } from "@talxis/client-libraries";

export interface IOnLoadResult {
    columns: IColumn[];
    data: {[key: string]: any};
    metadata: {
        PrimaryIdAttribute: string;
        PrimaryNameAttribute: string;
    }
}

export interface IOnSaveParams {
    updatedData: {[key: string]: any};
    recordId: string;
}

export interface IFormStrategy {
    onLoad: () => Promise<IOnLoadResult>;
    onSave: (params: IOnSaveParams) => Promise<IRecordSaveOperationResult>;
}