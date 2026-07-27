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
    data: {[key: string]: any};
}

export interface IFormStrategy {
    onLoad: () => Promise<IOnLoadResult>;
    onSave: (params: IOnSaveParams) => Promise<IRecordSaveOperationResult>;
}