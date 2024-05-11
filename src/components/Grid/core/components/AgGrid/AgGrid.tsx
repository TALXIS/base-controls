import { AgGridReact } from "@ag-grid-community/react/lib/agGridReact";
import { useTheme } from "@fluentui/react";
import { GridApi } from "ag-grid-community/dist/lib/gridApi";
import { useContext, useEffect, useRef } from "react";
import { useSelectionController } from "../../../selection/controllers/useSelectionController";
import { useGridController } from "../../controllers/useGridController";
import { useGridInstance } from "../../hooks/useGridInstance";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { getGridStyles } from "./styles";
import React from 'react';
import { useAgGridController } from "./controllers/useAgGridController";
import { Paging } from "../../../paging/components/Paging/Paging";
import { EmptyRecords } from "../EmptyRecords/EmptyRecords";

export const AgGrid = () => {
    const grid = useGridInstance();
    //@ts-ignore
    //const start = (props.dataset.paging.pageNumber - 1) * props.dataset.paging.pageSize + (props.dataset.paging.totalResultCount === 0 ? 0 : 1);
    //@ts-ignore
    //let end = props.dataset.paging.pageNumber * props.dataset.paging.pageSize;
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    //const [_, validate] = useRecordValidationServiceController();
    const theme = useTheme();
    const styles = getGridStyles(theme);
    let {agColumns, records, isEditable} = useAgGridController(gridApiRef);
    records = [];
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
            <AgGridReact
                animateRows
                singleClickEdit
                rowSelection={grid.selection.type}
                suppressRowClickSelection
                noRowsOverlayComponent={EmptyRecords}
                onCellDoubleClicked={(e) => {
                    if(!e.colDef.editable) {
                        grid.dataset.openDatasetItem(e.data!.getNamedReference())
                    }
                }}
                onCellClicked={(e) => {
                    if(!e.colDef.editable) {
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
            <Paging />
        </div>
    );
}