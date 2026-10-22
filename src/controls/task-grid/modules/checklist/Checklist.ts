import type { ColDef } from "ag-grid-community";
import { DataTypes, IColumn, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { CHECKLIST_LABELS, IChecklistLabels } from "./labels";
import { ChecklistCell } from "./components/adapters/checklist-cell";

export const CHECKLIST_COLUMN_NAME = 'checklist__virtual';

/** One item of a task's checklist. */
export interface IChecklistItem {
    id: string;
    name: string;
    isCompleted: boolean;
}

export interface IChecklistParameters {
    /** The task's checklist items, read from the task when its cell draws. */
    onGetItems: (task: IRecord) => IChecklistItem[];
    /** Overrides for the module's strings. */
    labels?: Partial<IChecklistLabels>;
}

/** The `checklist` module: each task's checklist progress in a read-only column. */
export interface IChecklist {
    getItems(task: IRecord): IChecklistItem[];
    getLabels(): ILocalizationService<IChecklistLabels>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** Each task's checklist progress, in a column Edit columns offers. */
export class Checklist implements IChecklist {
    private _parameters: IChecklistParameters;
    private _labels: ILocalizationService<IChecklistLabels>;
    private _unregisters: (() => void)[] = [];

    constructor(taskDatasetControl: ITaskDatasetControlRuntime, parameters: IChecklistParameters) {
        this._parameters = parameters;
        this._labels = new LocalizationService<IChecklistLabels>({ ...CHECKLIST_LABELS, ...parameters.labels });
        taskDatasetControl.services.whenAvailable('provider', this._onProviderAvailable);
        taskDatasetControl.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getItems(task: IRecord): IChecklistItem[] {
        return this._parameters.onGetItems(task);
    }

    public getLabels(): ILocalizationService<IChecklistLabels> {
        return this._labels;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        this._unregisters.push(provider.registerAvailableColumns(this._addColumn));
    };

    private _addColumn = (columns: IColumn[]): void => {
        if (columns.some(column => column.name === CHECKLIST_COLUMN_NAME)) {
            return;
        }
        columns.push({
            name: CHECKLIST_COLUMN_NAME,
            displayName: this._labels.getLocalizedString('checklist'),
            dataType: DataTypes.SingleLineText,
            isVirtual: true,
            visualSizeFactor: 100,
            disableSorting: true,
            metadata: { IsValidForUpdate: false, SupportedFilterConditionOperators: [] },
        });
    };

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const colDef = columnDefs.find(colDef => colDef.colId === CHECKLIST_COLUMN_NAME);
        if (colDef) {
            colDef.cellRenderer = ChecklistCell;
        }
    };
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Each task's checklist progress. */
        checklist: IChecklist;
    }
}
