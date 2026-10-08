import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { GRID_MODULE_PRIORITY } from "../../grid/modules/priorities";
import { RECORD_SAVE_COLUMN_KEY } from "../../grid/modules/editing/constants";
import { IGridCellCommands } from "../../grid/services/cells";
import { IGridColumnContext } from "../../grid/services/columns/colDef";
import { IGridServiceLocator } from "../../grid/services";
import { IGridCheckList } from "./GridCheckList";
import { CompletionCell } from "./completion-cell";
import { NameCell } from "./name-cell";
import { CONTROL_COLUMN_WIDTH, DELETE_COLUMN_NAME } from "./constants";

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

export interface ICheckListColumnsParameters {
    services: IGridServiceLocator;
    checkList: IGridCheckList;
}

/** The checkbox column first, the delete column last, and the stack rank hidden. */
export class CheckListColumns {
    private _services: IGridServiceLocator;
    private _checkList: IGridCheckList;
    private _deleteColumnDefinition: ColDef<IRecord>;

    constructor(parameters: ICheckListColumnsParameters) {
        this._services = parameters.services;
        this._checkList = parameters.checkList;
        this._deleteColumnDefinition = this._getDeleteColumnDefinition();
        this._services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, GRID_MODULE_PRIORITY.clipboard + 1);
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const { name, stackRank, completed } = this._checkList.getFieldMapping();
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
        if (this._services.find('editing')) {
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
            cell: { onGetCommands: this._onGetDeleteCommands },
        };
        return {
            ...CONTROL_COLUMN_DEFINITION,
            colId: DELETE_COLUMN_NAME,
            pinned: 'right',
            lockPosition: 'right',
            context: context,
        };
    }

    private _onGetDeleteCommands = (result: IGridCellCommands, params: { record: IRecord }): void => {
        if (!this._checkList.isItem(params.record)) {
            return;
        }
        const label = this._checkList.getLabels().getLocalizedString('deleteItem');
        const iconStyle = { color: this._services.get('theme').semanticColors.errorIcon };
        result.items.push({
            key: 'delete',
            iconOnly: true,
            iconProps: { iconName: 'ChromeClose' },
            title: label,
            ariaLabel: label,
            buttonStyles: { icon: iconStyle, iconHovered: iconStyle, iconPressed: iconStyle },
            onClick: () => {
                this._deleteItem(params.record);
            },
        });
    };

    private async _deleteItem(record: IRecord): Promise<void> {
        const confirmation = await this._services.get('pcfContext').navigation.openConfirmDialog({
            text: this._checkList.getLabels().getLocalizedString('confirmDialog.deleteItem.text'),
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
        for (const [field, columnName] of Object.entries(this._checkList.getFieldMapping())) {
            if (!columnsMap[columnName]) {
                throw new Error(`CheckList field mapping points "${field}" at column "${columnName}", which the data provider does not have. Available columns: ${Object.keys(columnsMap).join(', ')}.`);
            }
        }
    }
}
