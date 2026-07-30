import { IColumn, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { IFormStrategy, IOnLoadResult, IOnSaveParams } from "./interfaces";

export interface IMemoryStrategyParams {
    onGetColumns: () => IColumn[];
    onGetData: () => { [key: string]: any };
    onGetMetadata: () => IOnLoadResult['metadata'];
}


/**
 * An in-memory form strategy that keeps all data locally without performing
 * any network requests.
 *
 * Data, columns, and metadata are resolved lazily through constructor-supplied
 * getter callbacks so consumers can expose live state instead of a one-time
 * snapshot.
 */
export class MemoryStrategy implements IFormStrategy {
    private _onGetData: () => { [key: string]: any };
    private _onGetColumns: () => IColumn[];
    private _onGetMetadata: () => IOnLoadResult['metadata'];

    constructor(params: IMemoryStrategyParams) {
        this._onGetData = params.onGetData;
        this._onGetColumns = params.onGetColumns;
        this._onGetMetadata = params.onGetMetadata;
    }

    /**
     * Returns the current columns, data, and metadata from the configured
     * getter callbacks.
     */
    public async onLoad(): Promise<IOnLoadResult> {
        return {
            columns: this._onGetColumns(),
            data: this._onGetData(),
            metadata: this._onGetMetadata(),
        };
    }

    /**
     * Shallow-merges changed field values into the current in-memory data
     * object returned by the configured data getter.
     */
    public async onSave(params: IOnSaveParams): Promise<IRecordSaveOperationResult> {
        const { updatedData, recordId } = params;
        const currentData = this._onGetData();

        Object.assign(currentData, updatedData);
        return {
            success: true,
            fields: Object.keys(updatedData),
            recordId,
        }
    }
}