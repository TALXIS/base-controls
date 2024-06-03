import { AgGridReact } from '@ag-grid-community/react';
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { GridApi} from "@ag-grid-community/core";
import { useRef } from "react";
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

export const AgGrid = () => {
    const grid = useGridInstance();
    const selection = useSelectionController();
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    let { agColumns, records, maxNumberOfVisibleRecords, stateRef, getTotalColumnsWidth, onGridReady } = useAgGridController(gridApiRef);
    const pagingController = usePagingController();
    const styles = getGridStyles(theme, maxNumberOfVisibleRecords);

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

    return (
        <div 
            ref={containerRef} 
            className={`${styles.root} ag-theme-balham`}
            >
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
                rowBuffer={0}
                rowSelection={grid.selection.type}
                noRowsOverlayComponent={EmptyRecords}
                loadingOverlayComponent={LoadingOverlay}
                reactiveCustomComponents
                onRowSelected={(e) => {
                    //prevent infinite loop since we are also setting the rows
                    //when the selection comes from above
                    if (e.source.includes('api')) {
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
                onStateUpdated={(e) => stateRef.current = e.state}
                rowHeight={42}
                columnDefs={agColumns as any}
                rowData={records}
            >
            </AgGridReact>
            {pagingController.isEnabled &&
                <Paging />
            }
        </div>
    );
}