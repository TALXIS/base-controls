import { useEffect, useRef, useState } from "react";
import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { useGridService } from "@controls/grid/useGridService";
import type { IGridSavesEvents } from "../../GridSaves";

/** How long a successful save stays on screen before the cell goes back to what it was showing. */
const SUCCESS_VISIBLE_FOR = 2000;

/** What a record has to say about the last time the grid saved it. */
export interface IRecordSaveStatus {
    isSaving: boolean;
    /** `null` once there is nothing left to report. */
    saveResult: IRecordSaveOperationResult | null;
    clearSaveResult: () => void;
}

/** Follows a record's saves. */
export const useRecordSaveStatus = (record: IRecord): IRecordSaveStatus => {
    const { rerender } = useRerender();
    //the indicator is drawn by the editing module
    const saves = useGridService('editing')!.saves;
    const successTimeoutRef = useRef<NodeJS.Timeout>();
    const [saveResult, setSaveResult] = useState<IRecordSaveOperationResult | null>(null);

    const onSaveFinished = (result: IRecordSaveOperationResult) => {
        if (result.recordId !== record.getRecordId()) {
            return;
        }
        setSaveResult(result);
        clearTimeout(successTimeoutRef.current);
        //a failure stays until dismissed: it is the only place the reason for it is offered
        if (result.success) {
            successTimeoutRef.current = setTimeout(() => setSaveResult(null), SUCCESS_VISIBLE_FOR);
        }
    };

    //a save starting renders nothing by itself
    useEventEmitter<IGridSavesEvents>(saves.events, 'onSaveStarted', (recordId: string) => {
        if (recordId === record.getRecordId()) {
            rerender();
        }
    });
    useEventEmitter<IGridSavesEvents>(saves.events, 'onSaveFinished', onSaveFinished);

    useEffect(() => () => clearTimeout(successTimeoutRef.current), []);

    return {
        isSaving: saves.isSaving(record),
        saveResult: saveResult,
        clearSaveResult: () => setSaveResult(null),
    };
};
