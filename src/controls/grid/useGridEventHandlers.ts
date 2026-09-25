import { IDataProviderEventListeners, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { IGrid } from "./interfaces";
import { IGridRuntime, IGridRuntimeEvents } from "./services/runtime";
import { IGridEditedCell, IGridEditingEvents } from "./services/editing";
import { IGridColumnsEvents } from "./services/columns";

/** Hands what the grid's parts dispatch to the event props of the same name. */
export const useGridEventHandlers = (runtime: IGridRuntime, props: IGrid) => {
    const provider = runtime.services.get('provider');
    const columns = runtime.services.get('columns');
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onDataLoaded', () => props.onDataLoaded?.());
    useEventEmitter<IDataProviderEventListeners>(provider, 'onLoading', (isLoading: boolean) => props.onLoadingChanged?.(isLoading));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordsSelected', (selectedRecordIds: string[]) => props.onSelectionChanged?.(selectedRecordIds));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordColumnValueChanged', (record: IRecord, columnName: string, newValue: any) => props.onRecordValueChanged?.(record, columnName, newValue));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onBeforeRecordSaved', (record: IRecord) => props.onBeforeRecordSave?.(record));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onAfterRecordSaved', (result: IRecordSaveOperationResult) => props.onAfterRecordSave?.(result));
    useEventEmitter<IDataProviderEventListeners>(provider, 'onError', (message: string, details?: any) => props.onError?.(message, details));
    useEventEmitter<IGridEditingEvents>(runtime.services.get('cells').editing.events, 'onEditedCellChanged', (_previous: IGridEditedCell | undefined, next: IGridEditedCell | undefined) => props.onEditedCellChanged?.(next));
    useEventEmitter<IGridColumnsEvents>(columns.events, 'onCellDoubleClicked', (record: IRecord, columnName: string) => props.onCellDoubleClicked?.(record, columnName));
};
