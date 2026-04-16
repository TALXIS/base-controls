import { ColDef, GridApi, IRowNode, IsServerSideGroupOpenByDefaultParams, RowClassRules } from "@ag-grid-community/core";
import { ITaskDataProvider } from "../../../data-providers/task-data-provider";
import { DatasetConstants, IRawRecord, IRecord } from "@talxis/client-libraries";
import { GridDragHandler, IDragOperation } from "../grid-drag-handler";
import { GroupCell } from "../group-cell";
import { TreeExpandCollapseHeader } from "../cell-headers/tree-expand-collapse-header";
import { AddTaskButton } from "../cell-renderers/add-task-button";
import { ILocalizationService, ITaskGridLabels } from "../../../labels";
import { PercentComplete } from "../cell-renderers/percent-complete";
import { INativeColumns, ITaskGridDatasetControl } from "../../../interfaces";

export const ADD_TASK_COLUMN_NAME = 'addTask';


export interface IGridCustomizerStrategy {
    onInitialize: (customizer: IGridCustomizer) => void;
    onGetColumnDefinitions?: (columnDefs: ColDef<IRecord>[]) => ColDef<IRecord>[];
    onGetRowClassRules?: (rules: RowClassRules<IRecord>) => RowClassRules<IRecord>;
    onGetCellRenderer?: (colDef: ColDef<IRecord>) => any;
    onGetCellEditor?: (colDef: ColDef<IRecord>) => any;
    onRetrieveGridApi?: (gridApi: GridApi<IRecord>) => void;
}

export interface IGridCustomizer {
    getGridApi(): GridApi<IRecord>;
    getTaskDataProvider(): ITaskDataProvider;
    getDatasetControl(): ITaskGridDatasetControl;
    registerExpressionDecorator(columnName: string, registrator: () => void): void;
}

export interface IGridCustomizerParams {
    gridApi: GridApi<IRecord>;
    datasetControl: ITaskGridDatasetControl;
    strategy?: IGridCustomizerStrategy;
}

export class GridCustomizer implements IGridCustomizer {
    private _taskDataProvider: ITaskDataProvider;
    private _gridApi: GridApi<IRecord>;
    private _gridDragHandler: GridDragHandler;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _nativeColumns: INativeColumns;
    private _pcfContext: ComponentFramework.Context<any>;
    private _datasetControl: ITaskGridDatasetControl;
    private _strategy?: IGridCustomizerStrategy;

    constructor(options: IGridCustomizerParams) {
        this._datasetControl = options.datasetControl;
        this._taskDataProvider = this._datasetControl.getDataProvider();
        this._gridApi = options.gridApi;
        this._localizationService = this._datasetControl.getLocalizationService();
        this._nativeColumns = this._datasetControl.getNativeColumns();
        this._strategy = options.strategy;
        this._pcfContext = this._datasetControl.getPcfContext();

        this._gridDragHandler = new GridDragHandler({
            gridApi: this._gridApi,
            datasetControl: this._datasetControl
        });
        this._patchGridApi();

        this._gridApi.setGridOption('rowClassRules', this._getRowClassRules());
        this._taskDataProvider.taskEvents.addEventListener('onBeforeTasksDeleted', () => this._taskDataProvider.setLoading(true));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTasksDeleted', () => this._taskDataProvider.setLoading(false));
        this._taskDataProvider.taskEvents.addEventListener('onBeforeTaskMoved', () => this._taskDataProvider.setLoading(true));
        this._taskDataProvider.taskEvents.addEventListener('onBeforeTasksEdited', () => this._taskDataProvider.setLoading(true));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTasksEdited', () => this._taskDataProvider.setLoading(false));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTaskMoved', (movingFromTaskId, movingToTaskId, position) => this._moveInto(movingFromTaskId, movingToTaskId, position));
        this._taskDataProvider.taskEvents.addEventListener('onBeforeTasksCreated', (parentTaskId) => this._onBeforeTasksCreated(parentTaskId));
        this._taskDataProvider.taskEvents.addEventListener('onBeforeTemplateCreated', () => this._taskDataProvider.setLoading(true));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTemplateCreated', () => this._taskDataProvider.setLoading(false));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTasksCreated', (records, parentId) => this._onAfterTasksCreated(records, parentId));
        this._taskDataProvider.taskEvents.addEventListener('onError', (error, message) => this._onError(error, message));
        this._taskDataProvider.taskEvents.addEventListener('onRecordTreeUpdated', (updatedParentIds) => this._onRecordTreeUpdated(updatedParentIds));
        this._taskDataProvider.taskEvents.addEventListener('onTaskDataUpdated', (newData) => this._onAfterTaskDataUpdated(newData));
        this._gridDragHandler.addEventListener('onGragEnd', (dragOperation) => this._onDragEnd(dragOperation));
        this._strategy?.onInitialize?.(this);
    }

    public getDatasetControl(): ITaskGridDatasetControl {
        return this._datasetControl;
    }

    public getGridApi(): GridApi<IRecord> {
        return this._gridApi;
    }

    public getTaskDataProvider(): ITaskDataProvider {
        return this._taskDataProvider;
    }

    //makes sure we do not try to register an expression for a column that does not exist
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
                    originalSetGridOption(key, (params: IsServerSideGroupOpenByDefaultParams) => this._isServerSideGroupOpenByDefault(params));
                    break;
                }
                default: {
                    originalSetGridOption(key, value);
                }
            }
        }
    }

    private _isServerSideGroupOpenByDefault(params: IsServerSideGroupOpenByDefaultParams) {
        if (!params.data) {
            return false;
        }
        const matchingRecords = this._taskDataProvider.getRecordTree().getMatchingRecords();
        return !matchingRecords[params.data.getRecordId()];
    }

    private _injectAddTaskColumn(columnDefs: ColDef<IRecord>[]) {
        if (!columnDefs.find(colDef => colDef.colId === ADD_TASK_COLUMN_NAME)) {
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

    private _getColumnDefinitions(columnDefs: ColDef<IRecord>[]) {
        this._injectAddTaskColumn(columnDefs);
        for (const colDef of columnDefs) {
            colDef.onCellDoubleClicked = () => { }
            const columnName = colDef.colId as string;
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
                case this._nativeColumns.percentComplete: {
                    colDef.cellRenderer = PercentComplete;
                    break
                }
            }
        }

        columnDefs.sort((a, b) => this._getColumnPriority(a) - this._getColumnPriority(b));
        columnDefs = this._strategy?.onGetColumnDefinitions?.(columnDefs) ?? columnDefs;
        for (const colDef of columnDefs) {
            colDef.cellRenderer = this._strategy?.onGetCellRenderer?.(colDef) ?? colDef.cellRenderer;
            colDef.cellEditor = this._strategy?.onGetCellEditor?.(colDef) ?? colDef.cellEditor;
        }
        return columnDefs;

    }

    private _getColumnPriority(col: ColDef<IRecord>): number {
        if (col.colId === DatasetConstants.CHECKBOX_COLUMN_KEY) return 0;
        if (col.colId === ADD_TASK_COLUMN_NAME) return 1;
        if (col.field === this._nativeColumns.subject) return 2;
        return 3;
    }

    private _getRowClassRules(): RowClassRules<IRecord> {
        const rules: RowClassRules<IRecord> = {
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
                    const matchingRecordsMap = this._taskDataProvider.getRecordTree().getMatchingRecords();
                    return !matchingRecordsMap[params.data!.getRecordId()]
                }
                else {
                    return false;
                }
            }
        }
        return this._strategy?.onGetRowClassRules?.(rules) ?? rules;
    }

    private _getPathToParent(node: IRowNode<IRecord> | null): string[] {
        const path: string[] = [];
        let parent = node?.parent;
        while (parent) {
            path.push(parent.id!);
            parent = parent.parent;
        }
        return path.filter(id => id).reverse();
    }

    //undefined means we should target top level
    private _onRecordTreeUpdated = (affectedIds: (string | undefined)[]) => {
        for (const id of affectedIds) {
            if (!id) {
                this._gridApi.refreshServerSide();
            }
            else {
                const node = this._gridApi.getRowNode(id)!;
                this._gridApi.refreshServerSide({
                    route: this._getPathToParent(node)
                });
                this._gridApi.refreshServerSide({
                    route: [...this._getPathToParent(node), id]
                })
            }
        }
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
            const result = await this._pcfContext.navigation.openConfirmDialog({
                title: this._localizationService.getLocalizedString('confirmation'),
                text: this._getDragConfirmationMessage(dragOperation)
            });
            if (result.confirmed) {
                const draggedRecord = dragOperation.draggedNode.data!;
                const node = this._taskDataProvider.getRecordTree().getNode(draggedRecord.getRecordId());
                //TODO: figure out where this info will be kept
                const maxNumberOfChildren = 10;
                if (node.allChildren.length > maxNumberOfChildren) {
                    const result = await this._pcfContext.navigation.openConfirmDialog({
                        title: this._localizationService.getLocalizedString('confirmation'),
                        text: this._localizationService.getLocalizedString('reorderingTaskDialog.manyChildrenWarning', { numberOfRecords: (node.allChildren.length + 1).toString() })
                    });
                    if (result.confirmed) {
                        this._moveTask(dragOperation);
                    }
                }
                else {
                    this._moveTask(dragOperation);
                }
            }
        }
    }

    private _getDragConfirmationMessage(dragOperation: IDragOperation): string {
        const { draggedNode, overNode } = dragOperation;
        const movingToRecord = overNode.data!;
        const movingRecord = draggedNode.data!;
        let stringName: keyof ITaskGridLabels = 'reorderingTaskDialog.text.children';
        switch (dragOperation.dragOverSection) {
            case 'top': {
                stringName = 'reorderingTaskDialog.text.above';
                break;
            }
            case 'bottom': {
                stringName = 'reorderingTaskDialog.text.below';
                break;
            }
        }
        return this._localizationService.getLocalizedString(stringName, {
            baseRecord: movingRecord.getNamedReference().name,
            overBaseRecord: movingToRecord.getNamedReference().name
        });
    }


    private _isDragOperationAllowed(dragOperation: IDragOperation): boolean {
        const { draggedNode, overNode } = dragOperation;
        // Check if either node is null/undefined
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

    private _moveInto(movingFromRecordId: string, movingToRecordId: string, position: 'child' | 'above' | 'below') {
        this._taskDataProvider.setLoading(false);
        const draggedRecordNode = this._taskDataProvider.getRecordTree().getNode(movingFromRecordId);
        const draggedRecord = this._taskDataProvider.getRecordsMap()[movingFromRecordId];
        const draggedNode = this._gridApi.getRowNode(movingFromRecordId)!;
        const overNode = this._gridApi.getRowNode(movingToRecordId)!;

        let addIndex: number | null = draggedRecordNode.index;

        //first remove from old location
        this._gridApi.applyServerSideTransaction({
            route: this._getPathToParent(draggedNode),
            remove: [draggedRecord],
        });

        //update the store where dragged parent node is (so the arrow can disappear if needed)
        this._gridApi.applyServerSideTransaction({
            route: this._getPathToParent(draggedNode.parent),
            update: [draggedNode.data],
        });

        //update the store where over node is (so the arrow can appear if needed)
        this._gridApi.applyServerSideTransaction({
            route: this._getPathToParent(overNode),
            update: [overNode.data],
        });
        //then add to new location
        this._gridApi.applyServerSideTransaction({
            // i need to set route to parent of over node
            route: [...this._getPathToParent(overNode), ...(position === 'child' ? [overNode.id!] : [])],
            add: [draggedRecord],
            addIndex: addIndex !== null ? addIndex : undefined,
        });

        if (position === 'child') {
            overNode.setExpanded(true);
        }
        this._gridApi.refreshCells({
            columns: [this._nativeColumns.subject],
            force: true
        });
        this._taskDataProvider.clearSelectedRecordIds();
    }

    private _onBeforeTasksCreated = (parentId?: string) => {
        this._taskDataProvider.setLoading(true);
    }

    private _onAfterTasksCreated = (records: IRecord[], parentId?: string) => {
        this._taskDataProvider.setLoading(false);
        if (records.length > 0 && parentId) {
            const parentNode = this._gridApi.getRowNode(parentId);
            if (parentNode && !parentNode.expanded) {
                parentNode.setExpanded(true);
            }
        }
        if (!parentId && records.length > 0) {
            this._gridApi.ensureIndexVisible(0);
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

    private _onError = (error: any, message: string) => {
        this._taskDataProvider.setLoading(false);
        //we need to use openConfirmDialog because error message dialog does not work with new lines
        this._pcfContext.navigation.openConfirmDialog({
            title: this._localizationService.getLocalizedString('unexpectedErrorOccurred'),
            text: message
        })
    }
}