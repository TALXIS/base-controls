import * as React from "react";
import { ColDef as ColDefBase, GridApi as GridApiBase, IRowNode, IsGroupOpenByDefaultParams, IsServerSideGroupOpenByDefaultParams, RowClassRules as RowClassRulesBase } from "@ag-grid-community/core";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";
import { DatasetConstants, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { GridDragHandler, IDragOperation } from "../grid-drag-handler";
import { GridExpansionSync } from "../grid-expansion-sync";
import { GroupCell } from "../group-cell";
import { TreeExpandCollapseHeader } from "../cell-headers/tree-expand-collapse-header";
import { AddTaskButton } from "../cell-renderers/add-task-button";
import { HookRegistry } from "@utils";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { PERCENT_COMPLETE_CONTROL_NAME, PercentComplete } from "../cell-renderers/percent-complete";
import { INativeColumns, ITaskGridDatasetControl } from "@components/TaskGrid/interfaces";
import { PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME } from "@components/TaskGrid/modules/dependencies/DependenciesProvider";
import { CHECKLIST_COLUMN_NAME } from "@components/TaskGrid/modules/checklist/ChecklistProvider";
//type-only: components.tsx reaches back into TaskGrid/interfaces, so a value import would be a cycle
import type { ITaskGridCellProps, ITaskGridComponents } from "@components/TaskGrid/components/components";
import type { IDependenciesCellRendererProps } from "@components/TaskGrid/modules/dependencies/cell-renderer/DependenciesCellRenderer";

/** Name of the synthetic trailing column holding each row's add-task button. */
export const ADD_TASK_COLUMN_NAME = 'addTask';


/** AG Grid's `ColDef`, bound to the grid's record type. */
export type ColDef = ColDefBase<IRecord>;
/** AG Grid's `GridApi`, bound to the grid's record type. */
export type GridApi = GridApiBase<IRecord>;
/** AG Grid's `RowClassRules`, bound to the grid's record type. */
export type RowClassRules = RowClassRulesBase<IRecord>;


/**
 * Applied to the column definitions once they are built and the strategy has had its say — so a hook sees
 * the finished definitions and gets the last word on any of them.
 *
 * Mutates rather than returning: these are the definitions the grid is about to be given, and a hook that
 * adds or removes one writes to the array itself.
 */
export type GridColumnDefinitionsHook = (columnDefs: ColDef[]) => void;

/**
 * Strategy interface for deep customization of the AG Grid instance inside TaskGrid.
 *
 * Both hooks are optional, because one-time setup needs neither: the strategy takes the locator in its
 * constructor like every other module's, and reaches the grid from there.
 *
 * ```ts
 * class MyGridCustomizerStrategy implements IGridCustomizerStrategy {
 *     constructor({ services }: ITaskGridFactoryParams) {
 *         //registered with the modules, so it is already there
 *         services.get('gridCustomizer').registerExpressionDecorator('estimatedeffort', () => …);
 *         //the grid is built later, so it is waited for
 *         services.whenAvailable('gridApi', gridApi => gridApi.setGridOption('animateRows', true));
 *     }
 * }
 * ```
 *
 * This is the *descriptor's* say over the grid. A module contributing to the same definitions registers a
 * {@link GridColumnDefinitionsHook} instead, which runs after whatever the strategy returned.
 */
export interface IGridCustomizerStrategy {
    /** Receives the computed column definitions and may return a modified array. */
    onGetColumnDefinitions?: (columnDefs: ColDef[]) => ColDef[];
    /** Receives the default row class rules map and may return an extended or overridden version. */
    onGetRowClassRules?: (rules: RowClassRules) => RowClassRules;
}

/**
 * The grid's own AG Grid configuration, registered as the `gridCustomizer` service alongside the modules.
 *
 * `getGridApi` resolves the `gridApi` service, so it answers only once the grid has handed one over —
 * before that it throws, and a strategy that needs the api waits for that service instead.
 */
export interface IGridCustomizer {
    /** Returns the underlying AG Grid `GridApi`. */
    getGridApi(): GridApi;
    /** Returns the `ITaskDataProvider` that backs the grid data layer. */
    getTaskDataProvider(): ITaskDataProvider;
    /** Returns the `ITaskGridDatasetControl` runtime control interface. */
    getDatasetControl(): ITaskGridDatasetControl;
    /**
     * Registers a column-expression decorator only when the given column exists in the current columns map.
     * Prevents errors when registering decorators for columns that may not be present in all views.
     */
    registerExpressionDecorator(columnName: string, registrator: () => void): void;
    /**
     * Registers a hook over the column definitions. Runs on every definitions pass, after the strategy's
     * `onGetColumnDefinitions` — the strategy is the descriptor's say, hooks are the modules'.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     * Defaults to `0`, and hooks sharing a priority run in the order they were registered. A negative
     * priority orders a hook ahead of the default ones, never ahead of the strategy.
     */
    registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): void;
}

export interface IGridCustomizerParameters {
    /** Everything it runs on, resolved when it is needed rather than held. */
    services: ITaskGridServiceLocator;
}

/** The renderer and editor a column would get before any override is applied. */
interface IDefaultCellComponents {
    renderer?: any;
    editor?: any;
}

/**
 * Builds the grid's AG Grid configuration — column definitions, row class rules, cell components — and
 * hands the optional {@link IGridCustomizerStrategy} its chance to change each of them.
 */
export class GridCustomizer implements IGridCustomizer {
    private _services: ITaskGridServiceLocator;
    private _gridDragHandler!: GridDragHandler;
    private _gridExpansionSync?: GridExpansionSync;
    private _defaultCellComponents: Map<string, IDefaultCellComponents> = new Map();
    private _columnDefinitionsHooks = new HookRegistry<GridColumnDefinitionsHook>();
    private _recordIdsPendingRowRefresh: Set<string> = new Set();
    private _isRowRefreshScheduled: boolean = false;

    constructor(parameters: IGridCustomizerParameters) {
        this._services = parameters.services;
        //nothing here reaches for the grid: this is built with the modules, long before there is one
        this._services.whenAvailable('gridApi', gridApi => this._attachToGrid(gridApi));
    }

    public getDatasetControl(): ITaskGridDatasetControl {
        return this._datasetControl;
    }

    public getGridApi(): GridApi {
        return this._gridApi;
    }

    public getTaskDataProvider(): ITaskDataProvider {
        return this._taskDataProvider;
    }

    //everything that needs the grid, run the moment there is one — the drag handler writes grid options from its own
    //constructor, and the patched `setGridOption` has to be in place before the grid pushes its first columns. Once
    //only, for the first api: the control and the grid are built and thrown away together, so a second api under the
    //same control is a StrictMode double-mount rather than a lifecycle to support.
    private _attachToGrid(gridApi: GridApi) {
        this._gridDragHandler = new GridDragHandler({
            gridApi: gridApi,
            datasetControl: this._datasetControl
        });
        this._patchGridApi();
        this._gridExpansionSync = new GridExpansionSync({ services: this._services });
        this._registerEventListeners();
        gridApi.setGridOption('rowClassRules', this._getRowClassRules());
    }

    private get _gridApi(): GridApi {
        return this._services.get('gridApi');
    }

    private get _datasetControl(): ITaskGridDatasetControl {
        return this._services.get('datasetControl');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._services.get('taskDataProvider');
    }

    private get _nativeColumns(): INativeColumns {
        return this._services.get('nativeColumns');
    }

    private get _components(): ITaskGridComponents {
        return this._services.get('components');
    }

    //the customization the caller registered, if the module is there at all.
    private get _strategy(): IGridCustomizerStrategy | undefined {
        return this._services.find('gridCustomizerModule')?.strategy;
    }

    public registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): void {
        this._columnDefinitionsHooks.register(hook, priority);
    }

    public registerExpressionDecorator(columnName: string, registrator: () => void) {
        if (columnName && this._taskDataProvider.getColumnsMap()[columnName]) {
            registrator();
        }
    }

    private _patchGridApi() {
        const originalSetGridOption = this._gridApi.setGridOption.bind(this._gridApi);
        this._gridApi.setGridOption = (key: any, value: any): void => {
            switch (key) {
                case 'columnDefs': {
                    const columnDefs = this._getColumnDefinitions(value);
                    originalSetGridOption(key, columnDefs);
                    break;
                }
                case 'isServerSideGroupOpenByDefault': {
                    originalSetGridOption(key, (params: IsServerSideGroupOpenByDefaultParams) => this._isGroupOpenByDefault(params.data, () => value(params)));
                    break;
                }
                case 'isGroupOpenByDefault': {
                    originalSetGridOption(key, (params: IsGroupOpenByDefaultParams) => this._isGroupOpenByDefault(params.rowNode.data, () => value(params)));
                    break;
                }
                default: {
                    originalSetGridOption(key, value);
                }
            }
        }
    }

    //the grid's own default expanded level is handed over as the fallback, so a host that configures one
    //still gets it for a row the user has never touched
    private _isGroupOpenByDefault(record: IRecord | undefined, onGetFallback: () => boolean): boolean {
        if (!record) {
            return false;
        }
        return this._services.get('taskExpansion').shouldRenderExpanded(record.getRecordId(), onGetFallback);
    }

    private _injectAddTaskColumn(columnDefs: ColDef[]) {
        if (!this._taskDataProvider.isFlatListEnabled() && !columnDefs.find(colDef => colDef.colId === ADD_TASK_COLUMN_NAME)) {
            columnDefs.push({
                colId: ADD_TASK_COLUMN_NAME,
                headerName: '',
                pinned: 'left',
                width: 50,
                resizable: false,
                lockPinned: true,
                lockPosition: true,
                suppressMovable: true,
                suppressSizeToFit: true,
                cellRenderer: AddTaskButton,
                headerComponent: TreeExpandCollapseHeader
            })
        }
    }

    private _getColumnDefinitions(columnDefs: ColDef[]) {
        this._injectAddTaskColumn(columnDefs);
        for (const colDef of columnDefs) {
            //ag-grid derives colId from field, but fall back for defs that only carry one of the two
            const columnName = (colDef.colId ?? colDef.field) as string;
            const column = this._taskDataProvider.getColumnsMap()[columnName];
            const customCellRenderer = this._getCustomControlForColumn('renderer', column);
            const customCellEditor = this._getCustomControlForColumn('editor', column);
            switch (columnName) {
                case this._nativeColumns.subject: {
                    colDef.cellRenderer = GroupCell;
                    colDef.pinned = 'left';
                    break;
                }
                case DatasetConstants.CHECKBOX_COLUMN_KEY: {
                    colDef.lockPosition = true;
                    break;
                }
                case CHECKLIST_COLUMN_NAME: {
                    //get, not find: this column exists because the module does, so one in a view without
                    //it is a misconfiguration - better said out loud here than rendered as an empty cell
                    this._services.get('checklistModule');
                    colDef.cellRenderer = this._checklistCellRenderer;
                    //a task's checklist is not a value on the task, so there is nothing to edit
                    colDef.editable = false;
                    break;
                }
                case PREDECESSORS_COLUMN_NAME:
                case SUCCESSORS_COLUMN_NAME: {
                    //get, not find: these columns exist because the module does, so one in a view without
                    //it is a misconfiguration - better said out loud here, while the column definitions
                    //are built, than rendered as an empty cell
                    this._services.get('dependenciesModule');
                    colDef.cellRenderer = columnName === PREDECESSORS_COLUMN_NAME ? this._predecessorsCellRenderer : this._successorsCellRenderer;
                    //a task's dependencies are not a value on the task, so there is nothing to edit
                    colDef.editable = false;
                    break;
                }
            }
            switch(customCellRenderer) {
                case PERCENT_COMPLETE_CONTROL_NAME: {
                    colDef.cellRenderer = PercentComplete;
                    break;
                }
            }
            switch (customCellEditor) {
                case PERCENT_COMPLETE_CONTROL_NAME: {
                    colDef.cellEditor = PercentComplete;
                    break;
                }
            }
            //without the module the column falls back to whatever renderer it would otherwise get
            if (column?.metadata?.LookupMany && this._services.find('lookupManyModule')) {
                colDef.cellRenderer = this._lookupManyCellRenderer;
                colDef.autoHeight = true;
                //editing happens inside the picker, not through an ag-grid cell editor
                colDef.editable = false;
                colDef.suppressKeyboardEvent = () => true;
            }
        }

        columnDefs.sort((a, b) => this._getColumnPriority(a) - this._getColumnPriority(b));
        columnDefs = this._strategy?.onGetColumnDefinitions?.(columnDefs) ?? columnDefs;
        //before the cell-component overrides below, which own the renderer and editor identities
        this._columnDefinitionsHooks.apply(columnDefs);
        columnDefs.map(colDef => this._applyCellComponentOverrides(colDef));
        return columnDefs;

    }

    private _applyCellComponentOverrides(colDef: ColDef) {
        const columnName = (colDef.colId ?? colDef.field) as string;
        if (colDef.cellRenderer !== this._cellRenderer) {
            this._defaultCellComponents.set(columnName, { renderer: colDef.cellRenderer, editor: colDef.cellEditor });
        }
        colDef.cellRenderer = this._cellRenderer;
        colDef.cellEditor = this._cellEditor;
    }

    //one renderer serves both columns, bound to its direction here rather than through
    //`colDef.cellRendererParams` - that is a function AgGridModel owns, and it is what injects the
    //record, the column and the value every cell needs. Stable fields, so a column definition pass does
    //not hand ag-grid a new component identity each time
    private _predecessorsCellRenderer = (props: ITaskGridCellProps): React.ReactElement =>
        this._renderDependenciesCell({ ...props, direction: 'predecessors' });

    private _successorsCellRenderer = (props: ITaskGridCellProps): React.ReactElement =>
        this._renderDependenciesCell({ ...props, direction: 'successors' });

    //the module renders its own cell, so whatever it was built with - its default or an override - is
    //what appears here
    private _renderDependenciesCell = (props: IDependenciesCellRendererProps): React.ReactElement =>
        this._services.get('dependenciesModule').components.onRenderCell(props);

    private _checklistCellRenderer = (props: ITaskGridCellProps): React.ReactElement =>
        this._services.get('checklistModule').components.onRenderCell(props);

    private _lookupManyCellRenderer = (props: ITaskGridCellProps): React.ReactElement =>
        this._services.get('lookupManyModule').components.onRenderCell(props);

    private _cellRenderer = (props: ITaskGridCellProps): React.ReactElement => {
        return this._renderCell('renderer', props);
    }

    private _cellEditor = (props: ITaskGridCellProps): React.ReactElement => {
        return this._renderCell('editor', props);
    }

    private _renderCell(role: 'renderer' | 'editor', props: ITaskGridCellProps): React.ReactElement {
        const columnName = (props.colDef?.colId ?? props.colDef?.field) as string;
        const defaults = this._defaultCellComponents.get(columnName) ?? {};
        const component = role === 'renderer' ? defaults.renderer : defaults.editor;
        const components = this._components;
        const onRender = role === 'renderer' ? components.onRenderCellRenderer : components.onRenderCellEditor;
        return onRender(props, (props) => React.createElement(component, props));
    }

    private _getCustomControlForColumn(role: 'editor' | 'renderer', column?: IColumn): string | null {
        const control = column?.controls?.find(c => c.appliesTo === role || c.appliesTo === 'both');
        return control?.name ?? null;
    }

    private _getColumnPriority(col: ColDef): number {
        if (col.colId === DatasetConstants.CHECKBOX_COLUMN_KEY) return 0;
        if (col.colId === ADD_TASK_COLUMN_NAME) return 1;
        if (col.field === this._nativeColumns.subject) return 2;
        return 3;
    }

    private _getRowClassRules(): RowClassRules {
        const rules: RowClassRules = {
            'talxis_task-grid_row--drag-over-middle': (params) => {
                return !!params.data?.isActive() && this._getNodeDragOverSection(params.node) === 'middle'
            },
            'talxis_task-grid_row--drag-over-top': (params) => {
                return this._getNodeDragOverSection(params.node) === 'top'
            },
            'talxis_task-grid_row--drag-over-bottom': (params) => {
                return this._getNodeDragOverSection(params.node) === 'bottom'
            },
            'talxis_task-grid_row--inactive': (params) => {
                return !params.data?.isActive()
            },
            'talxis_task-grid_row--unmatched-parent': (params) => {
                if (params.data) {
                    return !this._taskDataProvider.getRecordTree().view.isMatching(params.data!.getRecordId())
                }
                else {
                    return false;
                }
            }
        }
        return this._strategy?.onGetRowClassRules?.(rules) ?? rules;
    }


    /**
     * Hands the grid the rows as they now are.
     *
     * The hierarchy is worked out from the rows themselves, so a create, a delete or a move is just the
     * new list — there is no level to patch, and no route to work out. `getRowId` is what lets the grid
     * keep the row objects it already has, so what is expanded, selected or being edited survives.
     */
    private _setRowData(): void {
        this._gridApi.setGridOption('rowData', this._taskDataProvider.getVisibleRecords());
    }

    //an undefined id means the top level
    private _onRecordTreeUpdated = () => {
        this._setRowData();
        this._gridApi.refreshCells({
            columns: [this._nativeColumns.subject],
            force: true
        });
        this._taskDataProvider.requestRender();
    }

    private _getNodeDragOverSection(node: IRowNode<IRecord>): IDragOperation['dragOverSection'] | null {
        const pendingDragOperation = this._gridDragHandler.getPendingDragOperation();
        if (!pendingDragOperation) {
            return null;
        }
        else {
            const isCurrentNode = pendingDragOperation.overNode === node;
            const isDraggedNode = pendingDragOperation.draggedNode === pendingDragOperation.overNode;
            if (isCurrentNode && !isDraggedNode) {
                return pendingDragOperation.dragOverSection;
            }
            else {
                return null;
            }
        }
    }

    private async _onDragEnd(dragOperation: IDragOperation) {
        if (this._isDragOperationAllowed(dragOperation)) {
            this._moveTask(dragOperation);
        }
    }

    private _isDragOperationAllowed(dragOperation: IDragOperation): boolean {
        const { draggedNode, overNode } = dragOperation;
        if (!draggedNode || !overNode) {
            return false;
        }
        if (draggedNode === overNode) {
            return false;
        }
        if (!overNode.data?.isActive() && dragOperation.dragOverSection === 'middle') {
            return false;
        }

        let parent = overNode.parent;
        while (parent) {
            if (parent === draggedNode) {
                return false;
            }
            parent = parent.parent;
        }
        return true;
    }

    private _getPositionFromDragOverSection(dragOverSection: IDragOperation['dragOverSection']): 'above' | 'below' | 'child' {
        switch (dragOverSection) {
            case 'top': {
                return 'above';
            }
            case 'bottom': {
                return 'below';
            }
            case 'middle': {
                return 'child';
            }
        }
    }

    private async _moveTask(dragOperation: IDragOperation) {
        const { draggedNode, overNode, dragOverSection } = dragOperation;
        const position = this._getPositionFromDragOverSection(dragOverSection);
        this._taskDataProvider.moveTask(draggedNode.id!, overNode.id!, position);
    }

    //a null result is a move that did not happen - the provider refused the drop, or the strategy cancelled - and
    //moving the store for it would show the user a move the data never made
    private _moveInto(movingFromRecordId: string, movingToRecordId: string, position: 'child' | 'above' | 'below', result: IRawRecord[] | null) {
        if (!result) {
            return;
        }
        //the record already moved in the data, and the rows carry the hierarchy, so the move is told to
        //the grid as the new row list
        this._setRowData();

        if (position === 'child') {
            this._services.get('taskExpansion').setExpanded(movingToRecordId, true);
        }
        this._gridApi.refreshCells({
            columns: [this._nativeColumns.subject],
            force: true
        });
        this._taskDataProvider.clearSelectedRecordIds();
    }


    private _onAfterTasksCreated = (records: IRawRecord[] | null, parentId?: string) => {
        if (!records || records.length === 0) return;
        if (parentId) {
            const parentNode = this._gridApi.getRowNode(parentId);
            if (parentNode && !parentNode.expanded) {
                parentNode.setExpanded(true);
            }
        }
        setTimeout(() => {
            const primaryIdAttribute = this._taskDataProvider.getMetadata().PrimaryIdAttribute;
            const recordId = records[0][primaryIdAttribute] as string;
            const node = this._gridApi.getRowNode(recordId);
            if (!node) return;
            if (records.length === 1 && this._datasetControl.isInlineCreateEnabled()) {
                const rowIndex = node.rowIndex!;
                this._gridApi.startEditingCell({
                    rowIndex: rowIndex,
                    colKey: this._nativeColumns.subject
                });
            }
            else {
                this._gridApi.setFocusedCell(node!.rowIndex!, this._nativeColumns.subject);
                this._gridApi.ensureNodeVisible(node!);
            }
        }, 100);
    }


    //row classes are a function of *saved* state — `isActive()` above all — and AG Grid only re-evaluates
    //`rowClassRules` when a row node's data changes, never on a `refreshCells`. A record whose values are edited in
    //place keeps its old classes forever, so every successful save refreshes its row. Only on success: a save that
    //failed leaves the record dirty, and the row as the user last saw it.
    private _onAfterRecordSaved = (result: IRecordSaveOperationResult) => {
        if (!result.success) {
            return;
        }
        //a bulk save reports every record on its own, so the rows they map to are refreshed in one pass
        this._recordIdsPendingRowRefresh.add(result.recordId);
        if (this._isRowRefreshScheduled) {
            return;
        }
        this._isRowRefreshScheduled = true;
        setTimeout(() => {
            this._isRowRefreshScheduled = false;
            const recordIds = this._recordIdsPendingRowRefresh;
            this._recordIdsPendingRowRefresh = new Set();
            this._refreshRowClasses(recordIds);
        }, 0);
    }

    //re-pushes each node's own record, which is what makes AG Grid run the row class rules over it again. `updateData`
    //with the same object refreshes the row's cells instead of replacing them, so an open cell editor is left alone —
    //`redrawRows` would destroy it mid-edit.
    private _refreshRowClasses(recordIds: Set<string>) {
        for (const node of this._gridApi.getRenderedNodes()) {
            if (node.data && node.id && recordIds.has(node.id)) {
                node.updateData(node.data);
            }
        }
    }

    private _onAfterTaskDataUpdated = (newData: IRawRecord[]) => {
        const recordIdsSet = new Set(newData.map(item => item[this._taskDataProvider.getMetadata().PrimaryIdAttribute]));
        const nodes = this._gridApi.getRenderedNodes().filter(node => recordIdsSet.has(node.id!));
        this._gridApi.refreshCells({
            rowNodes: nodes,
            force: true
        })
    }

    private _registerEventListeners() {
        this._taskDataProvider.taskEvents.addEventListener('onAfterTaskMoved', (movingFromTaskId, movingToTaskId, position, result) => this._moveInto(movingFromTaskId, movingToTaskId, position, result));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTasksCreated', (records, parentId) => this._onAfterTasksCreated(records, parentId));
        this._taskDataProvider.taskEvents.addEventListener('onRecordTreeUpdated', () => this._onRecordTreeUpdated());
        this._taskDataProvider.taskEvents.addEventListener('onTaskDataUpdated', (newData) => this._onAfterTaskDataUpdated(newData));
        this._taskDataProvider.addEventListener('onAfterRecordSaved', (result) => this._onAfterRecordSaved(result));
        this._gridDragHandler.addEventListener('onDragEnd', (dragOperation) => this._onDragEnd(dragOperation));
    }
}