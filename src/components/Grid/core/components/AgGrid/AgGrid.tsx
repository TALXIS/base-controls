import { AgGridReact } from "@ag-grid-community/react/lib/agGridReact";
import { useTheme } from "@fluentui/react";
import { GridApi } from "ag-grid-community/dist/lib/gridApi";
import { useRef } from "react";
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
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    //const [_, validate] = useRecordValidationServiceController();
    const theme = useTheme();
    const styles = getGridStyles(theme);
    let { agColumns, records, isEditable } = useAgGridController(gridApiRef);
    const selection = useSelectionController();

    /*     const validateCurrentRecords = () => {
            let index = 0;
            for (const record of records) {
                for (const column of columns) {
                    validate(column, record, index)
                }
                index++;
            }
        }
        useEffect(() => {
            if (!gridApiRef.current) {
                return;
            }
            validateCurrentRecords();
        }, [records, columns]); */

    return (
        <div className={`${styles.root} ag-theme-balham`}>
            {((isEditable && grid.props.parameters.ChangeEditorMode?.raw !== 'edit') || grid.props.parameters.ChangeEditorMode?.raw === 'read') &&
                <Save />
            }
            <AgGridReact
                animateRows
                singleClickEdit
                stopEditingWhenCellsLoseFocus
                domLayout={grid.props.parameters.ChangeEditorMode?.raw ? "autoHeight" : undefined}
                rowSelection={grid.selection.type}
                suppressRowClickSelection
                noRowsOverlayComponent={EmptyRecords}
                onCellDoubleClicked={(e) => {
                    //enable navigation
                    if (!e.colDef.editable) {
                        grid.dataset.openDatasetItem(e.data!.getNamedReference())
                    }
                }}
                onCellClicked={(e) => {
                    if (!e.colDef.editable && grid.props.parameters.SelectableRows?.raw) {
                        selection.toggle(e.data!);
                    }
                }}
                getRowId={(params) => params.data.getRecordId()}
                onGridReady={(e) => {
                    gridApiRef.current = e.api as any;
                    //gridContext.recordValidationService.setGridApi(e.api as any);
                    //validateCurrentRecords();
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