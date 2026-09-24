import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { IGrid } from "./interfaces";
import { IGridRuntime, IGridRuntimeEvents } from "./services/runtime";
import { IGridEditedCell } from "./services/editing";

/** Hands what the runtime dispatches to the event props of the same name. */
export const useGridEventHandlers = (runtime: IGridRuntime, props: IGrid) => {
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onDataLoaded', () => props.onDataLoaded?.());
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onLoadingChanged', (isLoading: boolean) => props.onLoadingChanged?.(isLoading));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onSelectionChanged', (selectedRecordIds: string[]) => props.onSelectionChanged?.(selectedRecordIds));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onRecordValueChanged', (record: IRecord, columnName: string, newValue: any) => props.onRecordValueChanged?.(record, columnName, newValue));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onBeforeRecordSave', (record: IRecord) => props.onBeforeRecordSave?.(record));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onAfterRecordSave', (result: IRecordSaveOperationResult) => props.onAfterRecordSave?.(result));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onError', (message: string, details?: any) => props.onError?.(message, details));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onEditedCellChanged', (cell?: IGridEditedCell) => props.onEditedCellChanged?.(cell));
    useEventEmitter<IGridRuntimeEvents>(runtime.events, 'onCellDoubleClicked', (record: IRecord, columnName: string) => props.onCellDoubleClicked?.(record, columnName));
};
