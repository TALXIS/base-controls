import { AgGridReact } from '@ag-grid-community/react';
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { ColumnMovedEvent, ColumnResizedEvent, GridApi } from "@ag-grid-community/core";
import { useEffect, useRef } from "react";
import { useSelectionController } from "../../../selection/controllers/useSelectionController";
import { useGridInstance } from "../../hooks/useGridInstance";
import { getGridStyles } from "./styles";
import React from 'react';
import { useAgGridController } from "./controllers/useAgGridController";
import { Paging } from "../../../paging/components/Paging/Paging";
import { EmptyRecords } from "./components/EmptyRecordsOverlay/EmptyRecords";
import { Save } from "../Save/Save";
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { usePagingController } from '../../../paging/controllers/usePagingController';
import { CHECKBOX_COLUMN_KEY } from '../../../constants';
import { IEntityRecord } from '../../../interfaces';

export const AgGrid = () => {
    const grid = useGridInstance();
    const selection = useSelectionController();
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    let { agColumns, records, maxNumberOfVisibleRecords, stateRef, getTotalColumnsWidth, onGridReady } = useAgGridController(gridApiRef);
    const pagingController = usePagingController();
    const styles = getGridStyles(theme, maxNumberOfVisibleRecords, grid.useContainerAsHeight);
    const resizeTimeOutRef = useRef<NodeJS.Timeout>();

    const getAvailableWidth = () => {
        const rootWrapper = containerRef.current?.querySelector('.ag-root-wrapper');
        return rootWrapper?.clientWidth ?? 0;
    }

    const sizeColumnsIfSpaceAvailable = () => {
        const availableWidth = getAvailableWidth();
        if (availableWidth > getTotalColumnsWidth()) {
            gridApiRef.current!.sizeColumnsToFit();
        }
    }

    const updateColumnOrder = async (e: ColumnMovedEvent<IEntityRecord, any>) => {
        //@ts-ignore - typings
        if (!window.TALXIS?.Portal) {
            //column order from Grid currently not supported in Power Apps
            return;
        }
        if(e.type === 'gridOptionsChanged') {
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
        //@ts-ignore: typings
        grid.pcfContext.factory.fireEvent('__clearColumns');
        for (const col of orderedColumns) {
            //@ts-ignore - portal accepts metadata
            await grid.dataset.addColumn!(col.name, col.alias, col)
        }
        grid.dataset.refresh();
    }

    const updateColumnVisualSizeFactor = async (e: ColumnResizedEvent<IEntityRecord, any>): Promise<void> => {
        if(e.source !== 'uiColumnResized') {
            return;
        }
        //@ts-ignore - typings
        if (!window.TALXIS?.Portal) {
            //column order from Grid currently not supported in Power Apps
            return;
        }
        clearTimeout(resizeTimeOutRef.current)
        resizeTimeOutRef.current = setTimeout(async () => {
            const resizedColumnKey = grid.dataset.columns.find(x => x.name === e.column?.getId())?.name;
            if (!resizedColumnKey) {
                return;
            }
            const columns = grid.dataset.columns;
            //@ts-ignore: typings
            grid.pcfContext.factory.fireEvent('__clearColumns');
            for (const { ...col } of columns) {
                if (col.name === resizedColumnKey) {
                    col.visualSizeFactor = e.column?.getActualWidth()!
                }
                //@ts-ignore - portal accepts metadata
                await grid.dataset.addColumn!(col.name, col.alias, col);
            }
            grid.pcfContext.factory.requestRender();
        }, 200);
    }
    return (
        <div
            ref={containerRef}
            className={`${styles.root} ag-theme-balham`}
        >
            {agColumns.length > 0 &&
                <>
                    {((grid.isEditable && grid.parameters.ChangeEditorMode?.raw !== 'edit') || grid.parameters.ChangeEditorMode?.raw === 'read') &&
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
                        noRowsOverlayComponent={EmptyRecords}
                        loadingOverlayComponent={LoadingOverlay}
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
                            if (e.colDef.colId === '__checkbox') {
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
                            sizeColumnsIfSpaceAvailable();
                            onGridReady();
                        }}
                        initialState={stateRef.current}
                        onStateUpdated={(e) => stateRef.current = {
                            ...stateRef.current,
                            ...e.state
                        }}
                        rowHeight={42}
                        columnDefs={agColumns as any}
                        rowData={records}
                    >
                    </AgGridReact>
                    {pagingController.isEnabled &&
                        <Paging />
                    }
                </>
            }
        </div>
    );
}