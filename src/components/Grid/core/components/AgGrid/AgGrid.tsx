import { AgGridReact } from '@ag-grid-community/react';
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { ColDef, ColumnMovedEvent, ColumnResizedEvent, GridApi, GridState, ModuleRegistry } from "@ag-grid-community/core";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGridInstance } from "../../hooks/useGridInstance";
import { getGridStyles } from "./styles";
import { Paging } from "../../../paging/components/Paging/Paging";
import { EmptyRecords } from "./components/EmptyRecordsOverlay/EmptyRecords";
import { Save } from "../Save/Save";
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { IRecord } from '@talxis/client-libraries';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { useGridController } from '../../controllers/useGridController';
import { useRerender, useStateValues } from '@talxis/react-components';
import { AgGrid as AgGridModel } from './model/AgGrid';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { AgGridContext } from './context';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const AgGrid = () => {
    const grid = useGridInstance();
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    const containerWidthRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const styles = useMemo(() => getGridStyles(theme, grid.height), [theme, grid.height]);
    const agGridReadyRef = useRef<boolean>(false);
    const agGrid = useMemo(() => new AgGridModel(grid, gridApiRef, theme), []);
    const agGridProviderValue = useMemo(() => agGrid, []);
    const { columns } = useGridController();
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);
    const [stateValuesRef, getNewStateValues, setDefaultStateValues] = useStateValues<GridState>(grid.state as GridState);
    //this is to prevent AgGrid from throwing errors in some rerender edge cases - https://github.com/ag-grid/ag-grid/issues/6013
    const [records] = useDebounce(grid.records, 0);
    const userChangedColumnSizeRef = useRef(false);
    const rerender = useRerender();
    const innerRerenderRef = useRef(true);

    const debouncedRefresh = useDebouncedCallback(() => {
        if (grid.loading) {
            return;
        }
        agGrid.refreshRowSelection(true);
        gridApiRef.current?.refreshCells({
            rowNodes: gridApiRef.current?.getRenderedNodes(),
        });
    }, 0);

    const debouncedSetAgColumns = useDebouncedCallback(() => {
        setAgColumns(agGrid.getColumns());
    }, 0);

    if (!innerRerenderRef.current) {
        debouncedRefresh();
    }

    const onGridReady = () => {
        agGridReadyRef.current = true;
        setDefaultStateValues({
            scroll: {
                top: 0,
                left: 0
            },
            ...gridApiRef.current!.getState(),
        });
        //agGrid.refreshRowSelection();
    }


    const sizeColumnsIfSpaceAvailable = () => {
        //do not autosize if user manually adjusted the column width
        if (!gridApiRef.current || userChangedColumnSizeRef.current) {
            return;
        }
        if (getCurrentContainerWidth() > grid.getTotalVisibleColumnsWidth()) {
            gridApiRef.current!.sizeColumnsToFit();
        }
    }

    const updateColumnOrder = async (e: ColumnMovedEvent<IRecord, any>) => {
        if (e.type === 'gridOptionsChanged') {
            return;
        }
        const sortedIds = e.api.getState().columnOrder?.orderedColIds;
        if (!sortedIds) {
            return;
        }
        const idIndexMap = new Map<string, number>();
        sortedIds.forEach((id, index) => {
            idIndexMap.set(id, index);
        });

        const orderedColumns = [...grid.dataset.columns].sort((a, b) => {
            const aIndex = idIndexMap.has(a.name) ? idIndexMap.get(a.name)! : sortedIds.length;
            const bIndex = idIndexMap.has(b.name) ? idIndexMap.get(b.name)! : sortedIds.length;
            return aIndex - bIndex;
        });
        grid.dataset.setColumns?.(orderedColumns);
    }

    const copyCellValue = useCallback((event: KeyboardEvent) => {
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
    }, []);

    const toggleOverlay = () => {
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
    }

    const getCurrentContainerWidth = (): number => {
        return containerWidthRef.current ?? containerRef.current?.clientWidth
    }

    const updateColumnVisualSizeFactor = useDebouncedCallback((e: ColumnResizedEvent<IRecord, any>) => {
        if (e.source !== 'uiColumnResized') {
            return;
        }
        const resizedColumnKey = grid.dataset.columns.find(x => x.name === e.column?.getId())?.name;
        if (!resizedColumnKey) {
            return;
        }
        const columns = grid.dataset.columns;
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].name === resizedColumnKey) {
                columns[i].visualSizeFactor = e.column?.getActualWidth()!
            }
        }
        userChangedColumnSizeRef.current = true;
        grid.dataset.setColumns?.(columns);
        gridApiRef.current?.resetRowHeights();

    }, 200);

    useEffect(() => {
        toggleOverlay();
        if (records.length > 0) {
            //gridApiRef.current?.ensureIndexVisible(0)
        }
    }, [grid.loading]);


    useEffect(() => {
        //this can be replaced with native functionality if we decide to use ag grid enterprise
        grid.keyHoldListener.addOnKeyDownHandler((event) => copyCellValue(event));
        agGrid.setRerenderCallback(() => {
            innerRerenderRef.current = true;
            rerender();
        });
        return () => {
            grid.pcfContext.mode.setControlState(getNewStateValues());
        }
    }, []);

    useEffect(() => {
        debouncedSetAgColumns()
    }, [columns]);

    useEffect(() => {
        sizeColumnsIfSpaceAvailable()
    }, [agColumns]);

    innerRerenderRef.current = false;

    return (
        <AgGridContext.Provider value={agGridProviderValue}>
            <button onClick={() => rerender}>rerender</button>
            <div
                ref={containerRef}
                className={`${styles.root} ag-theme-balham`}
            >
                {grid.isEditable && grid.dataset.isDirty?.() &&
                    <Save />
                }
                {grid.error &&
                    <MessageBar messageBarType={MessageBarType.error}>
                        <span dangerouslySetInnerHTML={{
                            __html: grid.errorMessage!
                        }} />
                    </MessageBar>
                }
                <AgGridReact
                    animateRows={false}
                    rowSelection={grid.selection.type}
                    noRowsOverlayComponent={Object.keys(grid.dataset.sortedRecordIds.length === 0) && !grid.loading ? EmptyRecords : undefined}
                    loadingOverlayComponent={grid.loading ? LoadingOverlay : undefined}
                    suppressDragLeaveHidesColumns
                    onColumnResized={(e) => updateColumnVisualSizeFactor(e)}
                    onColumnMoved={(e) => {
                        if (e.finished) {
                            updateColumnOrder(e);
                        }
                    }}
                    reactiveCustomComponents
                    onSelectionChanged={(e) => {
                        if (e.source.includes('api')) {
                            return;
                        }
                        grid.dataset.setSelectedRecordIds(e.api.getSelectedNodes().map(node => node.data!.getRecordId()));
                        agGrid.refreshRowSelection();
                    }}
                    gridOptions={{
                        getRowStyle: (params) => {
                            const theme = params.rowIndex % 2 === 0 ? agGrid.evenRowCellTheme : agGrid.oddRowCellTheme;
                            return {
                                backgroundColor: theme.semanticColors.bodyBackground
                            }
                        },
                    }}
                    onCellDoubleClicked={(e) => {
                        if (grid.isNavigationEnabled && !grid.isEditable) {
                            grid.openDatasetItem(e.data!.getNamedReference())
                        }
                    }}
                    getRowId={(params) => params.data.getRecordId()}
                    onGridReady={(e) => {
                        gridApiRef.current = e.api as any;
                        if (grid.loading) {
                            gridApiRef.current?.showLoadingOverlay();
                        }
                        onGridReady();
                    }}
                    onGridSizeChanged={(e) => {
                        containerWidthRef.current = e.clientWidth;
                        sizeColumnsIfSpaceAvailable();
                    }}
                    onFirstDataRendered={(e) => {
                        sizeColumnsIfSpaceAvailable();
                    }}

                    initialState={stateValuesRef.current}
                    onStateUpdated={(e) => stateValuesRef.current = {
                        ...stateValuesRef.current,
                        ...e.state
                    }}
                    //suppressAnimationFrame
                    columnDefs={agColumns as any}
                    
                    rowData={records}
                    getRowHeight={(params) => {
                        const columnWidths: { [name: string]: number } = {};
                        params.api.getAllGridColumns().map(col => {
                            columnWidths[col.getColId()] = col.getActualWidth()
                        })
                        return params?.data?.getHeight?.(columnWidths, grid.rowHeight) ?? grid.rowHeight
                    }}
                >
                </AgGridReact>
                {grid.paging.isEnabled &&
                    <Paging />
                }
            </div>
        </AgGridContext.Provider>
    );
}
