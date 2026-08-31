import { IEventEmitter, IRawRecord } from "@talxis/client-libraries";
import { ICheckListDatasetControl, ICheckListDatasetControlEvents } from "./CheckListDatasetControl";

/** Imperative API for a mounted checklist, handed over through `ICheckListProps.onReady`. */
export interface ICheckListApi {
    /** Returns the current items, including edits that have not been saved yet. */
    getData(): IRawRecord[];
    /** Returns the checklist's events, to subscribe to with `addEventListener`. */
    getEvents(): IEventEmitter<ICheckListDatasetControlEvents>;
}

export class CheckListApi implements ICheckListApi {
    private _datasetControl: ICheckListDatasetControl;

    constructor(datasetControl: ICheckListDatasetControl) {
        this._datasetControl = datasetControl;
    }

    public getData(): IRawRecord[] {
        return this._datasetControl.getData();
    }

    public getEvents(): IEventEmitter<ICheckListDatasetControlEvents> {
        return this._datasetControl.events;
    }
}
