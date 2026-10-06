import { IColumn, IDataProviderEventListeners, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { IGrid } from "./interfaces";
import { IGridRuntime, IGridRuntimeEvents } from "./services/runtime";
import { IGridColumnsEvents } from "./services/columns";
import { IGridRowsEvents } from "./services/rows";
import { IGridCellsEvents } from "./services/cells";

/** Hands what the grid's parts dispatch to the event props of the same name. */
export const useGridEventHandlers = (runtime: IGridRuntime, props: IGrid) => {
    const provider = runtime.services.get('provider');
    const columns = runtime.services.get('columns');
    const rows = runtime.services.get('rows');
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onDataLoaded', () => props.onDataLoaded?.());
    useEventEmitter<IDataProviderEventListeners>(provider, 'onLoading', (isLoading: boolean) => props.onLoadingChanged?.(isLoading));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordColumnValueChanged', (record: IRecord, columnName: string, newValue: any) => props.onRecordValueChanged?.(record, columnName, newValue));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onBeforeRecordSaved', (record: IRecord) => props.onBeforeRecordSaved?.(record));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onAfterRecordSaved', (result: IRecordSaveOperationResult) => props.onAfterRecordSaved?.(result));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onAfterSaved', (results: IRecordSaveOperationResult[]) => props.onAfterSaved?.(results));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onError', (message: string, details?: any) => props.onError?.(message, details));
    useEventEmitter<IGridColumnsEvents>(columns.events, 'onCellDoubleClicked', (record: IRecord, columnName: string) => props.onCellDoubleClicked?.(record, columnName));
    useEventEmitter<IGridColumnsEvents>(columns.events, 'onColumnsChanged', (columnsAfter: IColumn[]) => props.onColumnsChanged?.(columnsAfter));
    useEventEmitter<IGridRowsEvents>(rows, 'onRowClicked', (record: IRecord) => props.onRowClicked?.(record));
    useEventEmitter<IGridCellsEvents>(runtime.services.get('cells').events, 'onFocusedCellChanged', (record: IRecord | undefined, columnName: string | undefined) => props.onFocusedCellChanged?.(record, columnName));
};
