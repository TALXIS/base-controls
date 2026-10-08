import { IRecord } from "@talxis/client-libraries";
import { ILocalizationService, LocalizationService } from "@utils";
import { IGridRuntime } from "../../grid/services/runtime";
import { IGridServiceMap } from "../../grid/services/interfaces";
import { CHECK_LIST_LABELS, ICheckListLabels } from "../labels";
import { CheckListColumns } from "./CheckListColumns";
import { CheckListReordering } from "./CheckListReordering";
import { CheckListNewItemRow } from "./CheckListNewItemRow";


/** Which of the provider's columns carry the label, the order and the completion state. */
export interface ICheckListFieldMapping {
    /** Column holding the item's label. */
    name: string;
    /** Column the list is ordered by, hidden from the grid. */
    stackRank: string;
    /** Boolean column the item's completion is stored in, drawn as the checkbox column. */
    completed: string;
}

/** The grid's services, with the checklist's own. */
export interface ICheckListServiceMap extends IGridServiceMap {
    checkList: IGridCheckList;
}

export interface IGridCheckListParameters {
    runtime: IGridRuntime;
    fieldMapping: ICheckListFieldMapping;
    labels?: Partial<ICheckListLabels>;
}

/** What makes the grid a checklist. */
export interface IGridCheckList {
    getFieldMapping(): ICheckListFieldMapping;
    getLabels(): ILocalizationService<ICheckListLabels>;
    /** Whether the record is one of the list's items, not the row that adds one. */
    isItem(record: IRecord): boolean;
    isCompleted(record: IRecord): boolean;
}

export class GridCheckList implements IGridCheckList {
    private _runtime: IGridRuntime;
    private _fieldMapping: ICheckListFieldMapping;
    private _labels: ILocalizationService<ICheckListLabels>;

    constructor(parameters: IGridCheckListParameters) {
        this._runtime = parameters.runtime;
        this._fieldMapping = parameters.fieldMapping;
        this._labels = new LocalizationService<ICheckListLabels>({ ...CHECK_LIST_LABELS, ...parameters.labels });
        //before the grid's first load, which picks the order up
        this._runtime.services.get('provider').setSorting([{ name: this._fieldMapping.stackRank, sortDirection: 0 }]);
        new CheckListColumns({ services: this._runtime.services, checkList: this });
        if (this._runtime.services.find('editing')) {
            new CheckListReordering({ runtime: this._runtime, checkList: this });
            new CheckListNewItemRow({ runtime: this._runtime, checkList: this });
        }
    }

    public getFieldMapping(): ICheckListFieldMapping {
        return this._fieldMapping;
    }

    public getLabels(): ILocalizationService<ICheckListLabels> {
        return this._labels;
    }

    public isItem(record: IRecord): boolean {
        return record.getDataProvider() === this._runtime.services.get('provider');
    }

    public isCompleted(record: IRecord): boolean {
        //a TwoOptions field reads back as the string '1' or '0'
        return record.getValue(this._fieldMapping.completed) === '1';
    }
}
