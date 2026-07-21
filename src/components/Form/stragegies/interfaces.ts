import { IColumn } from "@talxis/client-libraries";

export interface IOnLoadResult {
    columns: IColumn[];
    data: {[key: string]: any};
    metadata: {
        PrimaryIdAttribute: string;
        PrimaryNameAttribute: string;
    }
}

export interface IFormStrategy {
    onLoad: () => Promise<IOnLoadResult>;
    onSave: (data: {[key: string]: any}) => Promise<void>;
}