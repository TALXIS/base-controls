import type { ColDef, SuppressKeyboardEventParams } from "ag-grid-community";
import { DataTypes, EventEmitter, IColumn, IDataProvider, IEventEmitter, IInternalDataProvider, IRawRecord, IRecord, IRecordSaveOperationResult, isQuickFindMatch, LookupCondition, Operators, unwrapConditionValue } from "@talxis/client-libraries";
import type { IColumnMenuSection, IGrid } from "@controls/grid";
import { ErrorHelper, type LabelsOf } from "@utils";
import type { ITaskColumnMatcher, ITaskDataProvider } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TaskColumnValues } from "../column-values";
import { LOOKUP_MANY_LABELS } from "./labels";
import { LookupManyCell } from "./components/adapters/lookup-many-cell";
import { LookupManyCellEditor } from "./components/adapters/lookup-many-cell-editor";
import { LookupManyColumnHeader } from "./components/adapters/lookup-many-column-header";
import type { ILookupManyEditorPopupComponents, ILookupManyFilterComponents, ILookupManyPillsComponents, ILookupManySelectComponents } from "./components/ui";

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
    /** A provider over the records the column can take, `undefined` for a read-only cell. */
    onCreateOptionsProvider(parameters: ILookupManyOptionsParameters<TColumn>): IDataProvider | undefined;
    /** Called as the lookup-many columns go. */
    destroy?(): void;
}

/** The replaceable parts of what the lookup-many columns draw, by the piece they belong to. */
export interface ILookupManyComponents {
    /** The records in a cell. */
    cell?: Partial<ILookupManyPillsComponents>;
    /** The picker a cell is edited in. */
    editor?: Partial<ILookupManySelectComponents>;
    /** The box the editor pops out in over the cell. */
    editorPopup?: Partial<ILookupManyEditorPopupComponents>;
    /** A column's filter callout. */
    filter?: Partial<ILookupManyFilterComponents>;
}

export interface ILookupManyParameters<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** The lookup-many columns by name. */
    columns: { [columnName: string]: TColumn };
    onCreateStore: (taskRuntime: ITaskRuntime) => ILookupManyStore<TColumn>;
    components?: ILookupManyComponents;
}

export interface ILookupManyEvents {
    /** The column whose filter callout is open changed. */
    onFilterChanged: (columnName: string | undefined) => void;
}

/** The `lookupMany` module with the columns it maps and their values. */
export interface ILookupMany {
    events: IEventEmitter<ILookupManyEvents>;
    readonly components: ILookupManyComponents;
    getColumn(columnName: string): ILookupManyColumn | undefined;
    /** The task's references in the column, none until the first load. */
    getValue(taskId: string, columnName: string): Reference[];
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Loads the tasks' references again, every loaded task's when none are given. */
    reload(taskIds?: string[]): Promise<void>;
    /** A provider over the records the column can take for a task or a filter. */
    createOptionsProvider(record: IRecord | undefined, column: IColumn): IDataProvider | undefined;
    /** The column's condition in the tasks' filter, if any. */
    getFilterCondition(columnName: string): Condition | undefined;
    /** Replaces the column's condition in the tasks' filter, removing it with `null`. */
    setFilterCondition(columnName: string, condition: Condition | null): void;
    /** Which column's filter callout is open, if any. */
    getOpenFilter(): string | undefined;
    openFilter(columnName: string): void;
    closeFilter(): void;
    /** Called as the mount goes. */
    destroy(): void;
}

//the picker's own keys while it is open
const PICKER_KEYS = new Set(['Enter', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

/** Columns holding several related records, drawn as pills and picked in a pop-out editor. */
export class LookupMany<TColumn extends ILookupManyColumn = ILookupManyColumn> implements ILookupMany {
    public events = new EventEmitter<ILookupManyEvents>();
    public readonly components: ILookupManyComponents;
    private _taskRuntime: ITaskRuntime;
    private _parameters: ILookupManyParameters<TColumn>;
    private _store: ILookupManyStore<TColumn>;
    private _labels: LabelsOf<typeof LOOKUP_MANY_LABELS>;
    private _values: TaskColumnValues;
    private _openFilter?: string;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: ILookupManyParameters<TColumn>) {
        this._taskRuntime = taskRuntime;
        this._parameters = parameters;
        this.components = parameters.components ?? {};
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = taskRuntime.getLabels(LOOKUP_MANY_LABELS);
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => Object.keys(parameters.columns),
            onLoad: this._loadValues,
            errorMessage: () => this._labels.get('lookupMany.loadLookupManyFailed'),
        });
        this._unregisters.push(
            taskRuntime.services.observe('provider', this._onProviderAvailable),
            taskRuntime.services.get('datasetControl').parts.observe('grid', this._onGridAvailable),
        );
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
        return this._values.getError();
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
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
        this._values.destroy();
        this.events.clearEventListeners();
        this._store.destroy?.();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        const unregisters = [
            provider.registerAvailableColumns(this._addColumns),
            provider.registerColumnHandler({ isHandledColumn: columnName => !!this.getColumn(columnName), onSaveValue: this._saveValue }),
            provider.registerColumnMatcher(this._matcher),
        ];
        return () => unregisters.forEach(unregister => unregister());
    };

    private _matcher: ITaskColumnMatcher = {
        isHandledColumn: columnName => !!this.getColumn(columnName),
        isMatchingCondition: (record, condition) => {
            const value: Reference[] = record.getValue(condition.attributeName) ?? [];
            return new LookupCondition().isValid({ value, formattedValue: value.map(reference => reference.name).join(', ') }, unwrapConditionValue(condition));
        },
        isMatchingSearch: (record, columnName, searchQuery) => (record.getValue(columnName) as Reference[] | null ?? []).some(reference => isQuickFindMatch(reference.name, searchQuery)),
    };

    //a task the store leaves out holds none
    private _loadValues = async (taskIds: string[]): Promise<Map<string, IRawRecord>> => {
        const loaded = await this._store.onLoadValues(taskIds);
        const empty = Object.fromEntries(Object.keys(this._parameters.columns).map(columnName => [columnName, []]));
        return new Map(taskIds.map(taskId => [taskId, { ...empty, ...loaded.get(taskId) }]));
    };

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

    //after the editing module whose editor this replaces
    private _onGridAvailable = (grid: IGrid): (() => void) => {
        return (grid as IGrid<ITaskGridServiceMap>).services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
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
