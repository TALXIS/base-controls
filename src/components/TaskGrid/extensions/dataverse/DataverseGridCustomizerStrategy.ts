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
    }
    
    public onGetColumnDefinitions(colDefs: ColDef[]): ColDef[] {
        for (const colDef of colDefs) {
            const column = this._getProvider().getColumnsMap()[colDef.field!];
            if (column?.name.endsWith(LOOKUP_MANY_COLUMN_NAME_SUFFIX)) {
                colDef.cellRenderer = CellRenderer;
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

}