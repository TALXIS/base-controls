import { AgGridReact } from "@ag-grid-community/react/lib/agGridReact";
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { GridApi } from "@ag-grid-community/core";
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
    const theme = useTheme();
    const styles = getGridStyles(theme);
    let { agColumns, records} = useAgGridController(gridApiRef);

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

    return (
        <div className={`${styles.root} ag-theme-balham`}>
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
                enterNavigatesVerticallyAfterEdit
                animateRows
                //singleClickEdit
                //enableCellTextSelection
                domLayout={grid.props.parameters.ChangeEditorMode?.raw ? "autoHeight" : undefined}
                rowSelection={grid.selection.type}
                suppressRowClickSelection
                noRowsOverlayComponent={EmptyRecords}
                onCellDoubleClicked={(e) => {
                    if (grid.isNavigationEnabled && !e.colDef.editable) {
                        grid.dataset.openDatasetItem(e.data!.getNamedReference())
                    }
                }}
                onRowClicked={(e) => {
                    if(selection.type && !grid.isEditable) {
                        if (!grid.isEditable) {
                            selection.toggle(e.data!);
                        }
                    }
                }}
                getRowId={(params) => params.data.getRecordId()}
                onGridReady={(e) => {
                    gridApiRef.current = e.api as any;
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