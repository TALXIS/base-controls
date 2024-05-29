import { ColDef, GridApi } from "@ag-grid-community/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { IEntityRecord } from "../../../../interfaces";
import { useGridController } from "../../../controllers/useGridController"
import { useGridInstance } from "../../../hooks/useGridInstance";
import { EditableCell } from "../../Cell/EditableCell/EditableCell";
import { ReadOnlyCell } from "../../Cell/ReadOnlyCell/ReadOnlyCell";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { AgGrid } from "../model/AgGrid";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { useDebounce } from 'use-debounce';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAgGridController {
    agColumns: ColDef[],
    records: IEntityRecord[],
    onGridReady: () => void;
}

export const useAgGridController = (gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>): IAgGridController => {
    const grid = useGridInstance();
    const agGridReadyRef = useRef<boolean>(false);
    const agGrid = useMemo(() => new AgGrid(grid, gridApiRef), [])
    const { columns, records } = useGridController();
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);
    //this is to prevent AgGrid from throwing errors in some rerender edge cases - https://github.com/ag-grid/ag-grid/issues/6013
    const [agRecords] = useDebounce(records, 0);

    useEffect(() => {
        if (!agGridReadyRef.current) {
            return;
        }
        agGrid.selectRows();
    }, [grid.dataset.getSelectedRecordIds().join('')]);

    const onGridReady = () => {
        agGridReadyRef.current = true;
        agGrid.selectRows();
    }
    useEffect(() => {
        if (columns.length === 0) {
            return;
        }
        const _agColumns = agGrid.columns;
        for (const agColumn of _agColumns) {
            agColumn.cellRenderer = ReadOnlyCell;
            agColumn.cellEditor = EditableCell;
            agColumn.headerComponent = ColumnHeader;

            if (agColumn.field === '__checkbox') {
                agColumn.lockPosition = 'left';
                agColumn.headerComponent = GlobalCheckBox
            }
        }
        setAgColumns(_agColumns);
    }, [columns]);

    return {
        agColumns: agColumns,
        records: agRecords,
        onGridReady: onGridReady
    }
}