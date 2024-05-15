import { ColDef, GridApi, IRowNode } from "ag-grid-community";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-balham.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>) {
        super(grid);
        this._gridApiRef = gridApiRef;
    }
    public get columns() {
        const agColumns: ColDef[] = [];
        for (const column of this._grid.columns) {
            const agColumn: ColDef = {
                field: column.key,
                headerName: column.displayName,
                width: column.width,
                sortable: column.isSortable,
                editable: column.isEditable,
                resizable: column.isResizable,
                suppressMovable: this._grid.props.parameters.ChangeEditorMode ? true : undefined,
                autoHeaderHeight: true,
                valueFormatter: (p) => {
                    return p.data.getFormattedValue(column.key)
                },
                valueGetter: (p) => {
                    return p.data.getValue(column.key)
                },
                cellRendererParams: {
                    baseColumn: column
                },
                cellEditorParams: {
                    baseColumn: column
                },
                headerComponentParams: {
                    baseColumn: column
                },
                //disable stop of editing on pressing Enter
                //TODO: only for specific column types?
                suppressKeyboardEvent: (params) => {
                    if(params.event.key === 'Enter') {
                        return true;
                    }
                    return false;
                }
            }
            agColumns.push(agColumn)
        }
        return agColumns;
    }
    public selectRows() {
        if(!this._gridApi) {
            return;
        }
        const nodesToSelect: IRowNode[] = [];
        this._gridApi.deselectAll();
        this._gridApi.forEachNode((node: IRowNode) => {
            if (this._grid.dataset.getSelectedRecordIds().includes(node.data.getRecordId())) {
                nodesToSelect.push(node);
            }
        });
        this._gridApi.setNodesSelected({
            nodes: nodesToSelect,
            newValue: true
        });
        //TODO: target the cells directly
        this._grid.pcfContext.factory.requestRender();
    }
    private get _gridApi() {
        return this._gridApiRef.current;
    }
}