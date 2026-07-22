import { IColumn } from "@talxis/client-libraries";
import { IFormStrategy, IOnLoadResult } from "./interfaces";

export interface IMemoryStrategyParams {
    columns: IColumn[];
    data: {[key: string]: any};
    metadata: IOnLoadResult['metadata'];
}


export class MemoryStrategy implements IFormStrategy {
    private _data: {[key: string]: any} = {};
    private _columns: IColumn[] = [];
    private _metadata: IOnLoadResult['metadata'];

    constructor(params: IMemoryStrategyParams) {
        this._data = params.data;
        this._columns = params.columns;
        this._metadata = params.metadata;
    }

    public async onLoad(): Promise<IOnLoadResult> {
        //simulate loading
        //await new Promise(resolve => setTimeout(resolve, 5000));
        return {
            columns: this._columns,
            data: this._data,
            metadata: this._metadata,
        };
    }

    public async onSave(data: {[key: string]: any}): Promise<void> {
        console.log('MemoryStrategy.onSave', data);
    }
}