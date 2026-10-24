import type { ColDef, SuppressKeyboardEventParams } from "ag-grid-community";
import { DataTypes, EventEmitter, IColumn, IDataProvider, IEventEmitter, IInternalDataProvider, IRecord, IRecordSaveOperationResult, isQuickFindMatch, LookupCondition, Operators, unwrapConditionValue } from "@talxis/client-libraries";
import type { GridCellLoadingHook, IColumnMenuSection, IGrid } from "@controls/grid";
import { ErrorHelper, ILocalizationService, LocalizationService } from "@utils";
import type { ITaskColumnMatcher, ITaskDataProvider, TaskLoadWaiter } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { ILookupManyLabels, LOOKUP_MANY_LABELS } from "./labels";
import { LookupManyCell } from "./components/adapters/lookup-many-cell";
import { LookupManyCellEditor } from "./components/adapters/lookup-many-cell-editor";
import { LookupManyColumnHeader } from "./components/adapters/lookup-many-column-header";

type Reference = ComponentFramework.EntityReference;
type Condition = ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;

const FILTER_OPERATORS = [
    Operators.Equal, Operators.DoesNotEqual, Operators.ContainValues, Operators.DoesNotContainValues, Operators.ContainsData, Operators.DoesNotContainData,
    Operators.Like, Operators.NotLike, Operators.BeginsWith, Operators.DoesNotBeginWith, Operators.EndsWith, Operators.DoesNotEndWith,
].map(operator => operator.Value);

/** How a lookup-many column draws its records. */
export type LookupManyAppearance =
    | { type: 'plain' }
    | { type: 'colorful'; /** The record field holding each pill's colour; `color` when left out. */ colorPropertyName?: string }
    | { type: 'people'; /** The record field holding each person's picture; `imageurl` when left out. */ imageUrlPropertyName?: string };

/** One lookup-many column, as the module's `columns` maps it. */
export interface ILookupManyColumn {
    displayName: string;
    /** The entity the column's records are of. */
    entityName: string;
    /** Plain when left out. */
    appearance?: LookupManyAppearance;
}

/** The cell a lookup-many option provider is created for. */
export interface ILookupManyOptionsParameters<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** Missing when the records are offered for a filter. */
    record?: IRecord;
    column: IColumn;
    /** What the module's `columns` maps the column to. */
    settings: TColumn;
    taskRuntime: ITaskRuntime;
}

/** Where lookup-many values are kept. */
export interface ILookupManyStore<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** Every mapped column's references of these tasks, by task id and column name. */
    onLoadValues(taskIds: string[]): Promise<Map<string, { [columnName: string]: Reference[] }>>;
    onSaveValue(taskId: string, columnName: string, value: Reference[]): Promise<void>;
    /** A provider over the records the column can take, searched as the user types; `undefined` leaves the cell read-only. */
    onCreateOptionsProvider(parameters: ILookupManyOptionsParameters<TColumn>): IDataProvider | undefined;
}

export interface ILookupManyParameters<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** The lookup-many columns by name. */
    columns: { [columnName: string]: TColumn };
    onCreateStore: (taskRuntime: ITaskRuntime) => ILookupManyStore<TColumn>;
    /** Overrides for the module's strings. */
    labels?: Partial<ILookupManyLabels>;
}

export interface ILookupManyEvents {
    /** The values of these tasks changed. */
    onValuesChanged: (taskIds: string[]) => void;
    onLoading: (isLoading: boolean) => void;
    /** The column whose filter callout is open changed. */
    onFilterChanged: (columnName: string | undefined) => void;
}

/** The `lookupMany` module: the columns it maps, their values, and the records each offers. */
export interface ILookupMany {
    events: IEventEmitter<ILookupManyEvents>;
    getColumn(columnName: string): ILookupManyColumn | undefined;
    /** The task's references in the column, as its record holds them; none until the first load. */
    getValue(taskId: string, columnName: string): Reference[];
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    getLabels(): ILocalizationService<ILookupManyLabels>;
    /** A provider over the records the column can take, for a task or a filter; `undefined` when it takes none. */
    createOptionsProvider(record: IRecord | undefined, column: IColumn): IDataProvider | undefined;
    /** The column's condition in the tasks' filter, if any. */
    getFilterCondition(columnName: string): Condition | undefined;
    /** Puts the condition in place of the column's in the tasks' filter, or removes it with `null`, and filters again. */
    setFilterCondition(columnName: string, condition: Condition | null): void;
    /** Which column's filter callout is open, if any. */
    getOpenFilter(): string | undefined;
    openFilter(columnName: string): void;
    closeFilter(): void;
    /** Called as the mount goes. */
    destroy(): void;
}

//the picker's own keys while it is open; Escape and Tab still close it
const PICKER_KEYS = new Set(['Enter', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

/** Columns holding several related records, drawn as pills and picked in a pop-out editor. */
export class LookupMany<TColumn extends ILookupManyColumn = ILookupManyColumn> implements ILookupMany {
    public events = new EventEmitter<ILookupManyEvents>();
    private _taskRuntime: ITaskRuntime;
    private _parameters: ILookupManyParameters<TColumn>;
    private _store: ILookupManyStore<TColumn>;
    private _labels: ILocalizationService<ILookupManyLabels>;
    private _isLoading = false;
    private _hasStartedLoading = false;
    private _currentLoad?: Promise<void>;
    private _error?: unknown;
    private _openFilter?: string;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: ILookupManyParameters<TColumn>) {
        this._taskRuntime = taskRuntime;
        this._parameters = parameters;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = new LocalizationService<ILookupManyLabels>({ ...LOOKUP_MANY_LABELS, ...parameters.labels });
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getColumn(columnName: string): TColumn | undefined {
        return this._parameters.columns[columnName];
    }

    public getValue(taskId: string, columnName: string): Reference[] {
        const provider = this._taskRuntime.getProvider();
        const record = provider.getRecordsMap()[taskId];
        //a record reads only the columns the view has
        return (record && provider.getColumnsMap()[columnName] ? record.getValue(columnName) : null) ?? [];
    }

    public getError(): unknown {
        return this._error;
    }

    public getLabels(): ILocalizationService<ILookupManyLabels> {
        return this._labels;
    }

    public getFilterCondition(columnName: string): Condition | undefined {
        return this._taskRuntime.getProvider().getFiltering()?.conditions.find(condition => condition.attributeName === columnName);
    }

    public setFilterCondition(columnName: string, condition: Condition | null): void {
        const provider: IDataProvider = this._taskRuntime.getProvider();
        const filtering = provider.getFiltering();
        const conditions = (filtering?.conditions ?? []).filter(existing => existing.attributeName !== columnName);
        (provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(() => {
            provider.setFiltering({ filterOperator: filtering?.filterOperator ?? 0, filters: filtering?.filters ?? [], conditions: condition ? [...conditions, condition] : conditions });
            provider.refresh();
        });
    }

    public getOpenFilter(): string | undefined {
        return this._openFilter;
    }

    public openFilter(columnName: string): void {
        this._openFilter = columnName;
        this.events.dispatchEvent('onFilterChanged', columnName);
    }

    public closeFilter(): void {
        this._openFilter = undefined;
        this.events.dispatchEvent('onFilterChanged', undefined);
    }

    public createOptionsProvider(record: IRecord | undefined, column: IColumn): IDataProvider | undefined {
        const settings = this.getColumn(column.name);
        return settings && this._store.onCreateOptionsProvider({ record, column, settings, taskRuntime: this._taskRuntime });
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this.events.clearEventListeners();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        provider.addEventListener('onFirstDataLoaded', this._onFirstDataLoaded);
        provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated);
        this._unregisters.push(
            provider.registerAvailableColumns(this._addColumns),
            provider.registerColumnHandler({ isHandledColumn: columnName => !!this.getColumn(columnName), onSaveValue: this._saveValue }),
            provider.registerColumnMatcher(this._matcher),
            provider.registerLoadWaiter(this._waitForValues),
            () => provider.removeEventListener('onFirstDataLoaded', this._onFirstDataLoaded),
            () => provider.taskEvents.removeEventListener('onTasksUpdated', this._onTasksUpdated),
        );
    };

    private _matcher: ITaskColumnMatcher = {
        isHandledColumn: columnName => !!this.getColumn(columnName),
        isMatchingCondition: (record, condition) => {
            const value: Reference[] = record.getValue(condition.attributeName) ?? [];
            return new LookupCondition().isValid({ value, formattedValue: value.map(reference => reference.name).join(', ') }, unwrapConditionValue(condition));
        },
        isMatchingSearch: (record, columnName, searchQuery) => (record.getValue(columnName) as Reference[] | null ?? []).some(reference => isQuickFindMatch(reference.name, searchQuery)),
    };

    private _onFirstDataLoaded = (): void => {
        if (!this._hasStartedLoading) {
            this._load(Object.keys(this._taskRuntime.getProvider().getRecordsMap()));
        }
    };

    //a sort, filter or search on these columns has to see the values
    private _waitForValues: TaskLoadWaiter = async params => {
        const provider = this._taskRuntime.getProvider();
        if (Object.keys(this._parameters.columns).some(columnName => provider.isColumnQueried(columnName))) {
            await (this._hasStartedLoading ? this._currentLoad : this._load(params.taskIds));
        }
    };

    private _onTasksUpdated = (records: IRecord[]): void => {
        this._load(records.map(record => record.getRecordId()));
    };

    private _load(taskIds: string[]): Promise<void> {
        this._hasStartedLoading = true;
        this._currentLoad = this._loadValues(taskIds);
        return this._currentLoad;
    }

    private async _loadValues(taskIds: string[]): Promise<void> {
        if (taskIds.length === 0) {
            return;
        }
        this._error = undefined;
        this._setLoading(true);
        const errorTitle = this._labels.getLocalizedString('loadLookupManyFailed');
        try {
            const loaded = await this._taskRuntime.execute(() => this._store.onLoadValues(taskIds), { loading: { show: false }, error: { title: errorTitle } });
            //a task the store leaves out holds none
            const empty = Object.fromEntries(Object.keys(this._parameters.columns).map(columnName => [columnName, []]));
            this._taskRuntime.getProvider().setTaskValues(new Map(taskIds.map(taskId => [taskId, { ...empty, ...loaded.get(taskId) }])));
            this.events.dispatchEvent('onValuesChanged', taskIds);
        }
        catch (error) {
            this._error = new Error(errorTitle, { cause: error });
        }
        finally {
            this._setLoading(false);
        }
    }

    private _setLoading(isLoading: boolean): void {
        this._isLoading = isLoading;
        this.events.dispatchEvent('onLoading', isLoading);
    }

    private _saveValue = async (record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult> => {
        const recordId = record.getRecordId();
        try {
            await this._store.onSaveValue(recordId, column.name, (value as Reference[] | null) ?? []);
            return { recordId, success: true, fields: [column.name] };
        }
        catch (error) {
            return { recordId, success: false, fields: [column.name], errors: [{ message: ErrorHelper.getMessageFromError(error), fieldName: column.name }] };
        }
    };

    private _addColumns = (columns: IColumn[]): void => {
        for (const [name, settings] of Object.entries(this._parameters.columns)) {
            if (!columns.some(column => column.name === name)) {
                columns.push({
                    name,
                    displayName: settings.displayName,
                    dataType: DataTypes.LookupSimple,
                    isVirtual: true,
                    visualSizeFactor: 200,
                    //the grid's filtering resolves a lookup condition's ids through the targets
                    metadata: { IsValidForUpdate: true, SupportedFilterConditionOperators: FILTER_OPERATORS, Targets: [settings.entityName] } as IColumn['metadata'],
                });
            }
        }
    };

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        //after the editing module, whose editor this replaces
        grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
        grid.services.get('cells').registerCellLoading(this._onCellLoading, TASK_GRID_PRIORITY.tree + 20);
    }

    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        if (this._isLoading && this.getColumn(params.columnName)) {
            result.isLoading = true;
        }
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        for (const colDef of columnDefs) {
            if (!this.getColumn(colDef.colId!)) {
                continue;
            }
            colDef.cellRenderer = LookupManyCell;
            colDef.cellEditor = LookupManyCellEditor;
            colDef.headerComponent = LookupManyColumnHeader;
            colDef.context = { ...colDef.context, header: { ...colDef.context?.header, onGetMenuSections: (sections: IColumnMenuSection[]) => this._redirectFilterItem(sections, colDef.colId!) } };
            colDef.cellEditorPopup = true;
            colDef.cellEditorPopupPosition = 'over';
            colDef.suppressKeyboardEvent = this._suppressKeyboardEvent;
        }
    };

    //the grid's own callout cannot pick these records
    private _redirectFilterItem(sections: IColumnMenuSection[], columnName: string): void {
        const filterItem = sections.find(section => section.key === 'filtering')?.items.find(item => item.key === 'filter');
        if (filterItem) {
            filterItem.onClick = () => this.openFilter(columnName);
        }
    }

    private _suppressKeyboardEvent = (params: SuppressKeyboardEventParams<IRecord>): boolean => {
        return params.editing && PICKER_KEYS.has(params.event.key);
    };
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Columns holding several related records. */
        lookupMany: ILookupMany;
    }
}
