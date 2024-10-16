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
import { useStateValues } from "@talxis/react-components";
import { IUpdatedRecord } from "../../../services/RecordUpdateService/model/RecordUpdateService";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAgGridController {
    agColumns: ColDef[],
    records: IEntityRecord[],
    stateRef: React.MutableRefObject<IAgGridState>
    getTotalColumnsWidth: () => number,
    onGridReady: () => void;
}

interface IAgGridState extends GridState {
    '__updatedRecords'?: IUpdatedRecord[];
    initialPageSize?: number;
}

export const useAgGridController = (gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>): IAgGridController => {
    const grid = useGridInstance();
    const pagingController = usePagingController();
    const agGridReadyRef = useRef<boolean>(false);
    const agGrid = useMemo(() => new AgGrid(grid, gridApiRef), [])
    const { columns } = useGridController();
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);
    const [stateValuesRef, getNewStateValues, setDefaultStateValues] = useStateValues<IAgGridState>(grid.state as IAgGridState);
    //this is to prevent AgGrid from throwing errors in some rerender edge cases - https://github.com/ag-grid/ag-grid/issues/6013
    const [agRecords] = useDebounce(grid.records, 0);

    useEffect(() => {
        gridApiRef.current?.refreshCells({
            rowNodes: gridApiRef.current?.getRenderedNodes()
        });
    }, [grid.records])

    useEffect(() => {
        if (!agGridReadyRef.current) {
            return;
        }
        agGrid.selectRows();
        gridApiRef.current?.refreshHeader();
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

    //this might be very Portal centric
    useEffect(() => {
        if (!gridApiRef.current) {
            return;
        }
        if (grid.loading) {
            gridApiRef.current.showLoadingOverlay();
            return;
        }
        gridApiRef.current.hideOverlay();
        setTimeout(() => {
            if (grid.records.length === 0) {
                gridApiRef.current?.showNoRowsOverlay();
            }
        }, 0);
    }, [grid.loading]);


    useEffect(() => {
        if (!gridApiRef.current) {
            return;
        }
        gridApiRef.current.ensureIndexVisible(0)
    }, [pagingController.pageNumber]);

    useEffect(() => {
        const onBeforeUnload = (ev: BeforeUnloadEvent) => {
            if (grid.recordUpdateService.isDirty) {
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

    //this can be replaced with native functionality if we decide to use ag grid enterprise
    useEffect(() => {
        const onKeyDownHandler = async (event: KeyboardEvent) => {
            // if control key(windows) or command key(iOS) + S key is clicked
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                const cell = gridApiRef.current?.getFocusedCell();
                if (!cell) {
                    return;
                }
                const row = gridApiRef.current?.getDisplayedRowAtIndex(cell.rowIndex);
                const formattedValue = gridApiRef.current?.getCellValue({
                    rowNode: row!,
                    colKey: cell.column.getColId(),
                    useFormatter: true
                })
                navigator.clipboard.writeText(formattedValue ?? "");
            }
        }
        window.addEventListener('keydown', onKeyDownHandler)
        return () => {
            window.removeEventListener('keydown', onKeyDownHandler);
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
            initialPageSize: undefined,
            __updatedRecords: []
        });
        agGrid.selectRows();
    }

    return {
        agColumns: agColumns,
        records: agRecords,
        stateRef: stateValuesRef,
        getTotalColumnsWidth: () => agGrid.getTotalColumnsWidth(),
        onGridReady: onGridReady
    }
}