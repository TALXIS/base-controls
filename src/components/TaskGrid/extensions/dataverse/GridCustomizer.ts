import { IRawRecord } from "@talxis/client-libraries";
import { ColDef, GridApi, IGridCustomizer, IGridCustomizerStrategy } from "../../components/grid";
import { ITaskDataProvider } from "../../data-providers";
import { LOOKUP_MANY_COLUMN_NAME_SUFFIX } from "./lookup-many/LookupManyHandler";
import { CellRenderer } from "./lookup-many/components/cell-renderer/CellRenderer";

export class GridCustomizer implements IGridCustomizerStrategy {
    private _customizer!: IGridCustomizer;
    private _provider?: ITaskDataProvider;
    private _gridApi!: GridApi;

    public onInitialize(customizer: IGridCustomizer): void {
        this._customizer = customizer;
        this._provider = customizer.getTaskDataProvider();
        this._gridApi = customizer.getGridApi();
        this._registerEventListeners();
    }
    
    public onGetColumnDefinitions(colDefs: ColDef[]): ColDef[] {
        for (const colDef of colDefs) {
            const column = this._getProvider().getColumnsMap()[colDef.field!];
            if (column?.name.endsWith(LOOKUP_MANY_COLUMN_NAME_SUFFIX)) {
                colDef.cellRenderer = CellRenderer
                colDef.autoHeight = true;
                colDef.editable = false;
                colDef.suppressKeyboardEvent = () => true;
            }
        }
        return colDefs;
    }

    private _getProvider(): ITaskDataProvider {
        if (!this._provider) {
            throw new Error('TaskDataProvider is not available in GridCustomizerStrategy. Have you called onInitialize?');
        }
        return this._provider;
    }

    private _registerEventListeners() {
        this._getProvider().taskEvents.addEventListener('onAfterTasksCreated', (records) => this._onAfterTasksCreated(records));
    }

    private _onAfterTasksCreated(records: IRawRecord[] | null) {
        if (!records) return;
        if (records.length === 1) {
            setTimeout(() => {
                const id = records[0][this._getProvider().getMetadata().PrimaryIdAttribute];
                const node = this._gridApi.getRowNode(id);
                if (!node) return;
                const rowIndex = node.rowIndex!;
                this._gridApi.startEditingCell({
                    rowIndex: rowIndex,
                    colKey: this._getProvider().getNativeColumns().subject
                });
            }, 100);
        }
    }
}