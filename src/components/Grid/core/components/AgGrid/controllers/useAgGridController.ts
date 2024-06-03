import { ColDef, GridApi, GridState } from "@ag-grid-community/core";
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
import { usePagingController } from "../../../../paging/controllers/usePagingController";
import { useStateValues } from "@talxis/react-components/dist/hooks";
import { IUpdatedRecord } from "../../../services/RecordUpdateService/model/RecordUpdateService";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAgGridController {
    agColumns: ColDef[],
    records: IEntityRecord[],
    maxNumberOfVisibleRecords: number;
    stateRef:  React.MutableRefObject<IAgGridState>
    getTotalColumnsWidth: () => number,
    onGridReady: () => void;
}

interface IAgGridState extends GridState {
    '__updatedRecords'?: IUpdatedRecord[]
}

export const useAgGridController = (gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>): IAgGridController => {
    const grid = useGridInstance();
    const pagingController = usePagingController();
    const agGridReadyRef = useRef<boolean>(false);
    const agGrid = useMemo(() => new AgGrid(grid, gridApiRef), [])
    const { columns, records } = useGridController();
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);
    const [stateValuesRef, getNewStateValues, setDefaultStateValues] = useStateValues<IAgGridState>(grid.state as IAgGridState);
    //this is to prevent AgGrid from throwing errors in some rerender edge cases - https://github.com/ag-grid/ag-grid/issues/6013
    const [agRecords] = useDebounce(records, 0);
    
    useEffect(() => {
        if (!agGridReadyRef.current) {
            return;
        }
        agGrid.selectRows();
    }, [grid.dataset.getSelectedRecordIds().join('')]);
    
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

    useEffect(() => {
        if (!gridApiRef.current) {
            return;
        }
        if (grid.loading) {
            gridApiRef.current.showLoadingOverlay();
            return;
        }
        gridApiRef.current.hideOverlay()
    }, [grid.loading]);

    useEffect(() => {
        if (!gridApiRef.current) {
            return;
        }
        gridApiRef.current.ensureIndexVisible(0)
    }, [pagingController.pageNumber]);

    useEffect(() => {
        const onBeforeUnload = (ev: BeforeUnloadEvent) => {
            if(grid.recordUpdateService.isDirty) {
                ev.preventDefault();
                return 'Unsaved changes!'
            }
        }
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            if (!gridApiRef.current) {
                return;
            }
            stateValuesRef.current.__updatedRecords = grid.recordUpdateService.updatedRecords;
            grid.pcfContext.mode.setControlState(getNewStateValues());
        }
    }, []);

//TODO: find a better way to achieve this
useEffect(() => {
        const globalClickHandler = (e: MouseEvent) => {
            const hasAncestorWithClass = (element: HTMLElement, className: string): boolean => {
                let parent = element;
                while (!parent.classList.contains('ag-theme-balham')) {
                    if (parent.classList.contains(className)) {
                        return true;
                    }
                    if (parent.tagName === 'HTML') {
                        return false;
                    }
                    parent = parent.parentElement!;
                    if (!parent) {
                        return true;
                    }
                }
                return false;
            };
            try {
                if (!hasAncestorWithClass(e.target as HTMLElement, 'ag-cell')) {
                    gridApiRef.current?.stopEditing();
                }
            }
            catch (err) {
            }
        }
        document.addEventListener('click', globalClickHandler)
        return () => {
            document.removeEventListener('click', globalClickHandler);
        }
    }, []);
    
    const onGridReady = () => {
        agGridReadyRef.current = true;
        setDefaultStateValues({
            ...gridApiRef.current!.getState(),
            __updatedRecords: []
        });
        agGrid.selectRows();
    }

    return {
        agColumns: agColumns,
        records: agRecords,
        maxNumberOfVisibleRecords: agGrid.maxNumberOfVisibleRecords,
        stateRef: stateValuesRef,
        getTotalColumnsWidth: () => agGrid.getTotalColumnsWidth(),
        onGridReady: onGridReady
    }
}