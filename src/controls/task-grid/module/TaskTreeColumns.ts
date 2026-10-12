import { ColDef } from "ag-grid-community";
import { ContextualMenuItemType, FontWeights } from "@fluentui/react";
import { IColumn, IRecord } from "@talxis/client-libraries";
import { IGridCellCommands, IGridColumnContext, IGridRuntime, RECORD_LOCK_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, SELECTION_COLUMN_KEY } from "@controls/grid";
import { ThemeBuilder } from "@theme";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { ITaskTreeServiceMap } from "./GridTaskTree";
import { AddTaskCell } from "./add-task-cell";
import { TreeCell } from "./tree-cell";
import { TreeExpansionHeader } from "./tree-expansion-header";
import { PercentCompleteCell } from "./percent-complete-cell";
import { ADD_TASK_COLUMN_NAME, PERCENT_COMPLETE_CONTROL_NAME, TASK_TREE_PRIORITY } from "./constants";

const LEADING_COLUMN_NAMES = new Set([SELECTION_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY, RECORD_LOCK_COLUMN_KEY]);

export interface ITaskTreeColumnsParameters {
    runtime: IGridRuntime<ITaskTreeServiceMap>;
}

/** The subject drawn as the tree, the add-task column beside it, and both pinned ahead of the rest. */
export class TaskTreeColumns {
    private _runtime: IGridRuntime<ITaskTreeServiceMap>;
    private _addTaskColumnDefinition: ColDef<IRecord>;

    constructor(parameters: ITaskTreeColumnsParameters) {
        this._runtime = parameters.runtime;
        this._addTaskColumnDefinition = this._getAddTaskColumnDefinition();
        this._runtime.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_TREE_PRIORITY);
        this._runtime.services.get('cells').registerCellTheme(this._onCellTheme, TASK_TREE_PRIORITY);
    }

    private get _taskGrid(): ITaskGridServiceLocator {
        return this._runtime.services.get('taskGrid');
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const subject = this._taskGrid.get('nativeColumns').subject;
        const columnsMap = this._taskGrid.get('taskDataProvider').getColumnsMap();
        if (!this._taskGrid.get('taskDataProvider').isFlatListEnabled()) {
            columnDefs.push(this._addTaskColumnDefinition);
        }
        for (const colDef of columnDefs) {
            if (colDef.colId === subject) {
                colDef.cellRenderer = TreeCell;
                colDef.pinned = 'left';
            }
            else if (colDef.colId === SELECTION_COLUMN_KEY) {
                colDef.lockPosition = true;
            }
            else if (this._isPercentComplete(columnsMap[colDef.colId!])) {
                colDef.cellRenderer = PercentCompleteCell;
            }
        }
        columnDefs.sort((a, b) => this._getColumnOrder(a, subject) - this._getColumnOrder(b, subject));
    };

    private _onCellTheme = (theme: ThemeBuilder, params: { columnName: string }): void => {
        if (params.columnName === this._taskGrid.get('nativeColumns').subject) {
            theme.edit('taskTree|subject', result => { result.fonts.medium.fontWeight = FontWeights.semibold; });
        }
    };

    private _isPercentComplete(column: IColumn | undefined): boolean {
        return !!column?.controls?.some(control => control.name === PERCENT_COMPLETE_CONTROL_NAME && control.appliesTo !== 'editor');
    }

    private _getColumnOrder(colDef: ColDef<IRecord>, subject: string): number {
        if (LEADING_COLUMN_NAMES.has(colDef.colId!)) {
            return 0;
        }
        if (colDef.colId === ADD_TASK_COLUMN_NAME) {
            return 1;
        }
        return colDef.colId === subject ? 2 : 3;
    }

    private _getAddTaskColumnDefinition(): ColDef<IRecord> {
        const context: IGridColumnContext = {
            alignment: 'center',
            cell: { onGetCommands: this._onGetAddTaskCommands },
        };
        return {
            colId: ADD_TASK_COLUMN_NAME,
            headerName: '',
            pinned: 'left',
            //the expand-all and collapse-all buttons of the header
            width: 48,
            resizable: false,
            sortable: false,
            lockPinned: true,
            lockPosition: true,
            suppressMovable: true,
            suppressSizeToFit: true,
            headerComponent: TreeExpansionHeader,
            cellRenderer: AddTaskCell,
            context: context,
        };
    }

    private _onGetAddTaskCommands = (result: IGridCellCommands, params: { record: IRecord }): void => {
        if (!params.record.isActive() || !this._taskGrid.get('taskGrid').isTaskCreatingEnabled()) {
            return;
        }
        const labels = this._taskGrid.get('localizationService');
        const taskDataProvider = this._taskGrid.get('taskDataProvider');
        const templates = this._taskGrid.find('templatesModule');
        const parentId = params.record.getRecordId();
        const addChild = () => {
            taskDataProvider.createTask(parentId);
        };
        result.items.push({
            key: 'addTask',
            iconOnly: true,
            iconProps: { iconName: 'Add' },
            //the cell is only as wide as the button
            menuIconProps: { style: { display: 'none' } },
            title: labels.getLocalizedString('addChild'),
            ariaLabel: labels.getLocalizedString('addChild'),
            onClick: templates ? undefined : addChild,
            subMenuProps: templates && {
                items: [
                    { key: 'addChild', text: labels.getLocalizedString('addChild'), iconProps: { iconName: 'Add' }, onClick: addChild },
                    { key: 'divider', itemType: ContextualMenuItemType.Divider },
                    {
                        key: 'taskFromTemplate',
                        text: labels.getLocalizedString('taskFromTemplate'),
                        iconProps: { iconName: 'PageList' },
                        subMenuProps: {
                            items: [{
                                key: 'templateSelector',
                                onRender: (_item, dismissMenu) => templates.components.onRenderTemplateSelector({
                                    onTemplateSelected: templateId => {
                                        dismissMenu(undefined, true);
                                        templates.provider.createTasksFromTemplate({ templateId, parentRecord: params.record });
                                    },
                                }),
                            }],
                        },
                    },
                ],
            },
        });
    };
}
