import { ColDef, GridApi } from "ag-grid-community";
import { useEffect, useMemo, useState } from "react";
import { IEntityRecord } from "../../../../interfaces";
import { useGridController } from "../../../controllers/useGridController"
import { useGridInstance } from "../../../hooks/useGridInstance";
import { EditableCell } from "../../Cell/EditableCell/EditableCell";
import { ReadOnlyCell } from "../../Cell/ReadOnlyCell/ReadOnlyCell";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { AgGrid } from "../model/AgGrid";
import { ModuleRegistry} from '@ag-grid-community/core/dist/esm/es6/modules/moduleRegistry';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-balham.css";
//@ts-ignore
window.__AG_ModuleRegistry = ModuleRegistry;
//@ts-ignore
window.__AG_ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAgGridController {
    agColumns: ColDef[],
    records: IEntityRecord[]
}

export const useAgGridController = (gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>): IAgGridController => {
    const grid = useGridInstance();
    const agGrid = useMemo(() => new AgGrid(grid, gridApiRef), [])
    const {columns, records} = useGridController();
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);

    //TODO: use deep equal
    useEffect(() => {
        agGrid.selectRows();
    }, [grid.dataset.getSelectedRecordIds()]);

    useEffect(() => {
        if(columns.length === 0) {
            return;
        }
        const _agColumns = agGrid.columns;
        for(const agColumn of _agColumns) {
            agColumn.cellRenderer = ReadOnlyCell;
            agColumn.cellEditor = EditableCell;
            agColumn.headerComponent = ColumnHeader;
            
            if(agColumn.field === '__checkbox') {
                agColumn.lockPosition = 'left';
                agColumn.headerComponent = GlobalCheckBox
            }
        }
        setAgColumns(_agColumns);
    }, [columns]);

    return {
        agColumns: agColumns,
        records: records
    }
}