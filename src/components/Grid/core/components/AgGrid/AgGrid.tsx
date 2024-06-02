import { AgGridReact } from '@ag-grid-community/react';
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { ColumnApi, GridApi, GridState } from "@ag-grid-community/core";
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
import { useStateValues } from '@talxis/react-components/dist/hooks';
import { usePagingController } from '../../../paging/controllers/usePagingController';
import { IUpdatedRecord } from '../../services/RecordUpdateService/model/RecordUpdateService';

interface IAgGridState extends GridState {
    '__updatedRecords'?: IUpdatedRecord[]
}

export const AgGrid = () => {
    const grid = useGridInstance();
    const selection = useSelectionController();
    const gridApiRef = useRef<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>();
    const gridColumnApiRef = useRef<ColumnApi>();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    //used for grid sizing - only the initial pageSize is relevant for this case
    let { agColumns, records, onGridReady } = useAgGridController(gridApiRef);
    const [stateValuesRef, getNewStateValues, setDefaultStateValues] = useStateValues<IAgGridState>(grid.state as IAgGridState);
    const pagingController = usePagingController();
    const pageSizeRef = useRef<number>(pagingController.pageSize);
    const firstRenderRef = useRef(true);

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
        return () => {
            if (!gridApiRef.current || grid.isNested) {
                return;
            }
            stateValuesRef.current.__updatedRecords = grid.recordUpdateService.updatedRecords;
            grid.pcfContext.mode.setControlState(getNewStateValues());
        }
    }, []);

    useEffect(() => {
        const onBeforeUnload = (ev: BeforeUnloadEvent) => {
            if(grid.recordUpdateService.isDirty) {
                ev.preventDefault();
                return 'Unsaved changes!'
            }
        }
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
        }
    }, []);

    useEffect(() => {
        if (!gridApiRef.current) {
            return;
        }
        if (grid.loading) {
            gridApiRef.current.showLoadingOverlay();
            return;
        }
        gridApiRef.current.hideOverlay()
    }, [grid.loading]);



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
        if (availableWidth > totalWidth) {
            gridApiRef.current!.sizeColumnsToFit();
        }
    }

    const getGridHeight = () => {
        if (pageSizeRef.current < grid.records.length) {
            return pageSizeRef.current;
        }
        return grid.records.length;
    }

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        gridApiRef.current?.ensureIndexVisible(0)
    }, [pagingController.pageNumber]);

    const styles = getGridStyles(theme, getGridHeight());
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
                rowBuffer={0}
                rowSelection={grid.selection.type}
                noRowsOverlayComponent={EmptyRecords}
                loadingOverlayComponent={LoadingOverlay}
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
                        gridApiRef.current?.setSuppressRowClickSelection(true);
                    }
                }}
                onCellMouseOut={(e) => {
                    gridApiRef.current?.setSuppressRowClickSelection(false);
                }}
                getRowId={(params) => params.data.getRecordId()}
                onGridReady={(e) => {
                    gridApiRef.current = e.api as any;
                    gridColumnApiRef.current = e.columnApi;
                    if (grid.loading) {
                        gridApiRef.current?.showLoadingOverlay();
                    }
                    setDefaultStateValues({
                        ...e.api.getState(),
                        __updatedRecords: []
                    });
                    sizeColumnsIfSpaceAvailable();
                    onGridReady();
                }}
                initialState={!grid.isNested ? stateValuesRef.current : undefined}
                onStateUpdated={(e) => {
                    if (grid.isNested) {
                        return;
                    }
                    stateValuesRef.current = e.state
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