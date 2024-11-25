import { AgGridReact } from '@ag-grid-community/react';
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { ColDef, ColumnMovedEvent, ColumnResizedEvent, GridApi, GridState, ModuleRegistry } from "@ag-grid-community/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelectionController } from "../../../selection/controllers/useSelectionController";
import { useGridInstance } from "../../hooks/useGridInstance";
import { getGridStyles } from "./styles";
import { Paging } from "../../../paging/components/Paging/Paging";
import { EmptyRecords } from "./components/EmptyRecordsOverlay/EmptyRecords";
import { Save } from "../Save/Save";
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { IRecord } from '@talxis/client-libraries';
import { CHECKBOX_COLUMN_KEY } from '../../../constants';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { useGridController } from '../../controllers/useGridController';
import { useStateValues } from '@talxis/react-components';
import { AgGrid as AgGridModel } from './model/AgGrid';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const AgGrid = () => {
    const grid = useGridInstance();
    const selection = useSelectionController();
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const styles = getGridStyles(theme, grid.height);
    const agGridReadyRef = useRef<boolean>(false);
    const agGrid = useMemo(() => new AgGridModel(grid, gridApiRef), [])
    const { columns } = useGridController();
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);
    const [stateValuesRef, getNewStateValues, setDefaultStateValues] = useStateValues<GridState>(grid.state as GridState);
    //this is to prevent AgGrid from throwing errors in some rerender edge cases - https://github.com/ag-grid/ag-grid/issues/6013
    const [records] = useDebounce(grid.records, 0);

    const debouncedRefresh = useDebouncedCallback(() => {
        gridApiRef.current?.refreshCells({
            rowNodes: gridApiRef.current?.getRenderedNodes(),
            force: true
        });
        sizeColumnsIfSpaceAvailable();
        gridApiRef.current?.refreshHeader();
        agGrid.selectRows();
    }, 0);

    debouncedRefresh();

    useEffect(() => {
        agGrid.selectRows();
    }, [records]);


    const onGridReady = () => {
        agGridReadyRef.current = true;
        setDefaultStateValues({
            scroll: {
                top: 0,
                left: 0
            },
            ...gridApiRef.current!.getState(),
        });
        agGrid.selectRows();
    }

    const getAvailableWidth = () => {
        const rootWrapper = containerRef.current?.querySelector('.ag-root-wrapper');
        return rootWrapper?.clientWidth ?? 0;
    }

    const sizeColumnsIfSpaceAvailable = () => {
        if(!gridApiRef.current) {
            return;
        }
        const availableWidth = getAvailableWidth();
        if (availableWidth > agGrid.getTotalColumnsWidth()) {
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
        grid.pcfContext.factory.requestRender()
    }

    const globalClickHandler = useCallback((e: MouseEvent) => {
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
    }, []);

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
        grid.dataset.setColumns?.(columns);
        gridApiRef.current?.resetRowHeights();
        grid.pcfContext.factory.requestRender()
    }, 200);

    //TODO: find a better way to achieve this
    useEffect(() => {
        document.addEventListener('click', globalClickHandler)
        return () => {
            document.removeEventListener('click', globalClickHandler);
        }
    }, []);

    useEffect(() => {
        setAgColumns(agGrid.columns);
    }, [columns]);

    useEffect(() => {
        toggleOverlay();
        gridApiRef.current?.ensureIndexVisible(0)
    }, [grid.loading]);


    useEffect(() => {
        //this can be replaced with native functionality if we decide to use ag grid enterprise
        grid.keyHoldListener.addOnKeyDownHandler((event) => copyCellValue(event));
        return () => {
            grid.pcfContext.mode.setControlState(getNewStateValues());
        }
    }, []);


    return (
        <div
            ref={containerRef}
            className={`${styles.root} ag-theme-balham`}
        >
            {agColumns.length > 0 &&
                <>
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
                        animateRows
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
                        onRowSelected={(e) => {
                            //prevent infinite loop since we are also setting the rows
                            //when the selection comes from above
                            if (e.source.includes('api') || e.source === 'gridInitializing') {
                                return;
                            }
                            selection.toggle(e.data!, e.node.isSelected()!)
                        }}
                        onCellDoubleClicked={(e) => {
                            if (grid.isNavigationEnabled && !grid.isEditable) {
                                grid.openDatasetItem(e.data!.getNamedReference())
                            }
                        }}
                        onCellMouseOver={(e) => {
                            if (e.colDef.colId === CHECKBOX_COLUMN_KEY) {
                                gridApiRef.current?.setGridOption('suppressRowClickSelection', true)
                            }
                        }}
                        onCellMouseOut={(e) => {
                            gridApiRef.current?.setGridOption('suppressRowClickSelection', false)
                        }}
                        getRowId={(params) => params.data.getRecordId()}
                        onGridReady={(e) => {
                            gridApiRef.current = e.api as any;
                            if (grid.loading) {
                                gridApiRef.current?.showLoadingOverlay();
                            }
                            sizeColumnsIfSpaceAvailable()
                            onGridReady();
                        }}
                        initialState={stateValuesRef.current}
                        onStateUpdated={(e) => stateValuesRef.current = {
                            ...stateValuesRef.current,
                            ...e.state
                        }}
                        suppressAnimationFrame
                        columnDefs={agColumns as any}
                        rowData={records}
                        getRowHeight={(params) => {
                            const columnWidths: { [name: string]: number } = {};
                            params.api.getAllGridColumns().map(col => {
                                columnWidths[col.getColId()] = col.getActualWidth()
                            })
                            return params?.data?.ui?.getHeight(columnWidths, grid.rowHeight)
                        }}

                    >
                    </AgGridReact>
                    {grid.paging.isEnabled &&
                        <Paging />
                    }
                </>
            }
        </div>
    );
}