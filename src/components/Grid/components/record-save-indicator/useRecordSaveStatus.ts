import { useEffect, useRef, useState } from "react";
import { IRecord, IRecordEvents, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";

/** How long a successful save stays on screen before the cell goes back to what it was showing. */
const SUCCESS_VISIBLE_FOR = 2000;

/** What a record has to say about the last time the grid saved it. */
export interface IRecordSaveStatus {
    isSaving: boolean;
    /** `null` once there is nothing left to report. */
    saveResult: IRecordSaveOperationResult | null;
    /** What a cell decides on before it gives up its space. */
    hasAnythingToReport: boolean;
    clearSaveResult: () => void;
}

/** Follows a record's saves. Call it once per cell: two callers are two answers that can disagree. */
export const useRecordSaveStatus = (record: IRecord): IRecordSaveStatus => {
    const rerender = useRerender();
    const successTimeoutRef = useRef<NodeJS.Timeout>();
    const [saveResult, setSaveResult] = useState<IRecordSaveOperationResult | null>(null);

    const onAfterSaved = (result: IRecordSaveOperationResult) => {
        setSaveResult(result);
        clearTimeout(successTimeoutRef.current);
        //a failure stays until dismissed: it is the only place the reason for it is offered
        if (result.success) {
            successTimeoutRef.current = setTimeout(() => setSaveResult(null), SUCCESS_VISIBLE_FOR);
        }
    };

    //`isSaving` is read off the record, so a save starting renders nothing by itself
    useEventEmitter<IRecordEvents>(record, 'onBeforeSaved', rerender);
    useEventEmitter<IRecordEvents>(record, 'onAfterSaved', onAfterSaved);

    useEffect(() => () => clearTimeout(successTimeoutRef.current), []);

    const isSaving = record.isSaving();
    return {
        isSaving: isSaving,
        saveResult: saveResult,
        hasAnythingToReport: isSaving || !!saveResult,
        clearSaveResult: () => setSaveResult(null),
    };
};
