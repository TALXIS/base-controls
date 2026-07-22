import { IColumn } from "@talxis/client-libraries";
import { IFormStrategy, IOnLoadResult } from "./interfaces";

export interface IMemoryStrategyParams {
    columns: IColumn[];
    data: {[key: string]: any};
    metadata: IOnLoadResult['metadata'];
}


/**
 * An in-memory form strategy that keeps all data locally without
 * performing any network requests. When data is saved, it is merged into the original object passed via the constructor.
 */
export class MemoryStrategy implements IFormStrategy {
    private _data: {[key: string]: any} = {};
    private _columns: IColumn[] = [];
    private _metadata: IOnLoadResult['metadata'];

    constructor(params: IMemoryStrategyParams) {
        this._data = params.data;
        this._columns = params.columns;
        this._metadata = params.metadata;
    }

    /**
     * Returns the columns, data, and metadata held in memory.
     */
    public async onLoad(): Promise<IOnLoadResult> {
        return {
            columns: this._columns,
            data: this._data,
            metadata: this._metadata,
        };
    }

    /**
     * Shallow-merges the changed field values into the in-memory data store.
     * Because `this._data` is the same reference passed via the constructor,
     * the caller's original object is also updated.
     */
    public async onSave(data: {[key: string]: any}): Promise<void> {
        Object.assign(this._data, data);
    }
}