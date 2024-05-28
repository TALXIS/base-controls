import { AgGridReact } from "@ag-grid-community/react/lib/agGridReact";
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { ColumnApi, GridApi } from "@ag-grid-community/core";
import { useEffect, useRef } from "react";
import { useSelectionController } from "../../../selection/controllers/useSelectionController";
import { useGridInstance } from "../../hooks/useGridInstance";
import { getGridStyles } from "./styles";
import React from 'react';
import { useAgGridController } from "./controllers/useAgGridController";
import { Paging } from "../../../paging/components/Paging/Paging";
import { EmptyRecords } from "../EmptyRecords/EmptyRecords";
import { Save } from "../Save/Save";

export const AgGrid = () => {
    const grid = useGridInstance();
    const selection = useSelectionController();
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    const gridColumnApiRef = useRef<ColumnApi>();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    let { agColumns, records, onGridReady} = useAgGridController(gridApiRef);
    const styles = getGridStyles(theme, grid.paging.pageSize);

    useEffect(() => {
        document.addEventListener('click', (e) => {
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
        })
    }, []);

    const getColumnsWidth = () => {
        let width = 0;
        for (const column of gridColumnApiRef.current!.getAllGridColumns()) {
            width = width + column.getActualWidth();
        }
        return width;
    }

    const getAvailableWidth = () => {
        const rootWrapper = containerRef.current?.querySelector('.ag-root-wrapper');
        return rootWrapper?.clientWidth ?? 0;
    }

    const sizeColumnsIfSpaceAvailable = () => {
        const totalWidth = getColumnsWidth();
        const availableWidth = getAvailableWidth();
        if(availableWidth > totalWidth) {
            gridApiRef.current!.sizeColumnsToFit();
        }
    }
    return (
        <div ref={containerRef} className={`${styles.root} ag-theme-balham`}>
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
                //singleClickEdit
                //enableCellTextSelection
                //domLayout={grid.props.parameters.ChangeEditorMode?.raw ? "autoHeight" : undefined}
                //rowMultiSelectWithClick
                rowSelection={grid.selection.type}
                noRowsOverlayComponent={EmptyRecords}
                //suppressRowClickSelection
                isRowSelectable={(node) => selection.type && !grid.isEditable ? true : false}
                onRowSelected={(e) => {
                    console.log(e);
                    //prevent infinite loop since we are also setting the rows
                    //when the selection comes from above
                    if(e.source.includes('api')) {
                        return;
                    }
                    selection.toggle(e.data!, e.node.isSelected()!)
                }}
                onCellDoubleClicked={(e) => {
                    if (grid.isNavigationEnabled && !grid.isEditable) {
                        grid.openDatasetItem(e.data!.getNamedReference())
                    }
                }}
                getRowId={(params) => params.data.getRecordId()}
                onGridReady={(e) => {
                    gridApiRef.current = e.api as any;
                    gridColumnApiRef.current = e.columnApi;
                    sizeColumnsIfSpaceAvailable();
                    onGridReady();
                }}
                rowHeight={42}
                columnDefs={agColumns as any}
                rowData={records}
            >
            </AgGridReact>
            {grid.props.parameters.EnablePagination?.raw !== false &&
                <Paging />
            }
        </div>
    );
}