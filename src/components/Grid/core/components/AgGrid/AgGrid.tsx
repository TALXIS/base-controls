import { AgGridReact } from "@ag-grid-community/react/lib/agGridReact";
import { useTheme } from "@fluentui/react";
import { GridApi } from "ag-grid-community/dist/lib/gridApi";
import { useContext, useEffect, useRef } from "react";
import { GridContext } from "../../../Grid";
import { useSelectionController } from "../../../selection/controllers/useSelectionController";
import { useGridController } from "../../controllers/useGridController";
import { useAgGrid } from "./hooks/useAgGrid";
import { useGridInstance } from "../../hooks/useGridInstance";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { getGridStyles } from "./styles";

export const AgGrid = () => {
    const grid = useGridInstance();
    const [isEditable, columns, records] = useGridController();
    //@ts-ignore
    //const start = (props.dataset.paging.pageNumber - 1) * props.dataset.paging.pageSize + (props.dataset.paging.totalResultCount === 0 ? 0 : 1);
    //@ts-ignore
    //let end = props.dataset.paging.pageNumber * props.dataset.paging.pageSize;
    const gridContext = useContext(GridContext);
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>(null);
    //const selection = useSelectionController();
    //const [_, validate] = useRecordValidationServiceController();
    const theme = useTheme();
    const styles = getGridStyles(theme);
    const { agColumns, selectRows } = useAgGrid(columns);

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


    //TODO: make deep equal
/*     useEffect(() => {
        selectRows(gridApiRef);
    }, [props.dataset.getSelectedRecordIds()]) */

    return (
        <div className={`${styles.root} ag-theme-balham`}>
{/*             <Save /> */}
            <AgGridReact
                animateRows
                singleClickEdit
                //rowSelection={grid.props.parameters.SelectableRows.raw}
                suppressRowClickSelection
                onRowDoubleClicked={(e) => {
                    //props.onOpenDatasetItem(e.data.getNamedReference())
                }}
                onCellKeyDown={(e) => {
                    //e.event.stopPropagation()
                }}
                onRowClicked={(e) => {
                    if (!isEditable) {
                        //toggleSelection(e.data);
                    }
                }}
                getRowId={(params) => params.data.getRecordId()}
                onGridReady={(e) => {
                    //gridApiRef.current = e.api as any;
                    //gridContext.recordValidationService.setGridApi(e.api as any);
                    //validateCurrentRecords();
                    //selectRows(gridApiRef);
                }}
                rowHeight={42}
                columnDefs={agColumns as any}
                rowData={records}
            >
            </AgGridReact>
{/*             {!props.hidePagination &&
                <CommandBar
                    className="TALXIS__view__footer"
                    items={[{
                        key: 'CurrentItems',
                        text: props.getTranslation("pages", { start: start, end: end, recordcount: props.dataset.paging.totalResultCount >= 0 ? props.dataset.paging.totalResultCount : "5000+" }),
                        ariaLabel: props.getTranslation("currentItems"),
                        disabled: true,
                    }]}
                    farItems={[{
                        key: 'FirstPage',
                        text: props.getTranslation("firstPage"),
                        ariaLabel: props.getTranslation("firstPage"),
                        iconOnly: true,
                        iconProps: { iconName: 'DoubleChevronLeft' },
                        disabled: !props.dataset.paging.hasPreviousPage,
                        onClick: () => props.dataset.paging.reset(),
                    }, {
                        key: 'PreviousPage',
                        text: props.getTranslation("back"),
                        ariaLabel: props.getTranslation("back"),
                        iconOnly: true,
                        iconProps: { iconName: 'Back' },
                        disabled: !props.dataset.paging.hasPreviousPage,
                        onClick: () => {
                            //@ts-ignore
                            props.dataset.paging.loadExactPage(props.dataset.paging.pageNumber - 1)
                        }
                    }, {
                        key: 'CurrentPage',
                        text: props.getTranslation("currentPage", {
                            //@ts-ignore
                            pagenumber: props.pageNumber
                        }),
                        ariaLabel: 'Current Page',
                        disabled: true,
                    }, {
                        key: 'NextPage',
                        text: props.getTranslation("next"),
                        ariaLabel: props.getTranslation("next"),
                        iconOnly: true,
                        iconProps: { iconName: 'Forward' },
                        disabled: !props.dataset.paging.hasNextPage,
                        onClick: () => {
                            //@ts-ignore
                            props.dataset.paging.loadExactPage(props.dataset.paging.pageNumber + 1)
                        }
                    }]}
                />
            } */}
        </div>
    );
}