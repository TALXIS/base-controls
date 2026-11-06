import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { GRID_MODULE_PRIORITY, RECORD_SAVE_COLUMN_KEY, IGridCellCommands, IGridColumnContext, IGridServiceLocator } from "@controls/grid";
import { IGridChecklist } from "../GridChecklist";
import { CHECKLIST_LABELS } from "../../../labels";
import { CompletionCell } from "../adapters/completion-cell";
import { NameCell } from "../adapters/name-cell";
import { CONTROL_COLUMN_WIDTH, DELETE_COLUMN_NAME } from "../constants";

//AG Grid's colDef defaults are `{ resizable: true, sortable: true }`
const CONTROL_COLUMN_DEFINITION: ColDef<IRecord> = {
    headerName: '',
    width: CONTROL_COLUMN_WIDTH,
    minWidth: CONTROL_COLUMN_WIDTH,
    maxWidth: CONTROL_COLUMN_WIDTH,
    resizable: false,
    sortable: false,
    suppressMovable: true,
    suppressSizeToFit: true,
    lockPinned: true,
};

export interface IChecklistColumnsParameters {
    services: IGridServiceLocator;
    checklist: IGridChecklist;
}

/** The checkbox column first, the delete column last, and the stack rank hidden. */
export class ChecklistColumns {
    private _services: IGridServiceLocator;
    private _checklist: IGridChecklist;
    private _deleteColumnDefinition: ColDef<IRecord>;

    constructor(parameters: IChecklistColumnsParameters) {
        this._services = parameters.services;
        this._checklist = parameters.checklist;
        this._deleteColumnDefinition = this._getDeleteColumnDefinition();
        this._services.get('columns').hooks.columnDefinitions.add(this._onColumnDefinitions, GRID_MODULE_PRIORITY.clipboard + 1);
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const { name, stackRank, completed } = this._checklist.getFieldMapping();
        this._assertColumnsExist();
        const hiddenColumnIds = new Set([stackRank, RECORD_SAVE_COLUMN_KEY]);
        for (let index = columnDefs.length - 1; index >= 0; index--) {
            if (hiddenColumnIds.has(columnDefs[index].colId!)) {
                columnDefs.splice(index, 1);
            }
        }
        const completedIndex = columnDefs.findIndex(colDef => colDef.colId === completed);
        if (completedIndex !== -1) {
            const [completedColDef] = columnDefs.splice(completedIndex, 1);
            columnDefs.unshift(this._applyCompletedColumn(completedColDef));
        }
        const nameColDef = columnDefs.find(colDef => colDef.colId === name);
        if (nameColDef) {
            nameColDef.cellRenderer = NameCell;
        }
        if (this._services.get('grid').modules.find('editing')) {
            columnDefs.push(this._deleteColumnDefinition);
        }
    };

    //changed in place, so the grid keeps treating it as one of its own columns
    private _applyCompletedColumn(colDef: ColDef<IRecord>): ColDef<IRecord> {
        return Object.assign(colDef, CONTROL_COLUMN_DEFINITION, {
            pinned: 'left',
            lockPosition: 'left',
            editable: false,
            cellRenderer: CompletionCell,
        } satisfies ColDef<IRecord>);
    }

    private _getDeleteColumnDefinition(): ColDef<IRecord> {
        const context: IGridColumnContext = {
            alignment: 'center',
            cell: { commandsHook: this._onCellCommands },
        };
        return {
            ...CONTROL_COLUMN_DEFINITION,
            colId: DELETE_COLUMN_NAME,
            pinned: 'right',
            lockPosition: 'right',
            context: context,
        };
    }

    private _onCellCommands = (result: IGridCellCommands, parameters: { record: IRecord }): void => {
        if (!this._checklist.isItem(parameters.record)) {
            return;
        }
        const label = this._services.get('labels').getLabels(CHECKLIST_LABELS).get('checklist.deleteItem');
        const iconStyle = { color: this._services.get('theme').semanticColors.errorIcon };
        result.items.push({
            key: 'delete',
            iconOnly: true,
            iconProps: { iconName: 'ChromeClose' },
            title: label,
            ariaLabel: label,
            buttonStyles: { icon: iconStyle, iconHovered: iconStyle, iconPressed: iconStyle },
            onClick: () => {
                this._deleteItem(parameters.record);
            },
        });
    };

    private async _deleteItem(record: IRecord): Promise<void> {
        const confirmation = await this._services.get('pcfContext').navigation.openConfirmDialog({
            text: this._services.get('labels').getLabels(CHECKLIST_LABELS).get('checklist.confirmDialog.deleteItem.text'),
        });
        if (!confirmation.confirmed) {
            return;
        }
        const result = await this._services.get('provider').deleteRecords([record.getRecordId()]);
        if (result.success) {
            this._services.get('gridApi').applyTransaction({ remove: [record] });
        }
    }

    private _assertColumnsExist(): void {
        const columnsMap = this._services.get('provider').getColumnsMap();
        for (const [field, columnName] of Object.entries(this._checklist.getFieldMapping())) {
            if (!columnsMap[columnName]) {
                throw new Error(`CheckList field mapping points "${field}" at column "${columnName}", which the data provider does not have. Available columns: ${Object.keys(columnsMap).join(', ')}.`);
            }
        }
    }
}
