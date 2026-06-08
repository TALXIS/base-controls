import { ColDef, GridApi, IGridCustomizer, IGridCustomizerStrategy } from "../../components/grid";
import { ITaskDataProvider } from "../../providers";
import { FetchXmlLookupManyCellRenderer } from "./lookup-many/cell-renderer/FetchXmlLookupManyCellRenderer";

/**
 * Ready-to-use {@link IGridCustomizerStrategy} for the Dataverse / Talxis platform.
 *
 * Automatically applies custom cell renderers to lookup-many columns (columns whose
 * `metadata.LookupMany` is set). Returned by {@link DataverseTaskGridDescriptor} by default.
 *
 * Extend or replace this class via `onCreateGridCustomizerStrategy` on your descriptor when
 * you need additional AG Grid column, editor, or row-class customizations.
 */
export class DataverseGridCustomizerStrategy implements IGridCustomizerStrategy {
    private _customizer!: IGridCustomizer;
    private _provider?: ITaskDataProvider;
    private _gridApi!: GridApi;

    /** Stores references to the customizer, task data provider, and grid API. Called once by the internal `GridCustomizer` after the AG Grid instance is ready. */
    public onInitialize(customizer: IGridCustomizer): void {
        this._customizer = customizer;
        this._provider = customizer.getTaskDataProvider();
        this._gridApi = customizer.getGridApi();
    }

    /** Injects the lookup-many {@link CellRenderer} and sets `autoHeight`/non-editable flags for any column whose `metadata.LookupMany` is set. */
    public onGetColumnDefinitions(colDefs: ColDef[]): ColDef[] {
        for (const colDef of colDefs) {
            const column = this._getProvider().getColumnsMap()[colDef.field!];
            if (column?.metadata?.LookupMany) {
                colDef.cellRenderer = FetchXmlLookupManyCellRenderer;
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