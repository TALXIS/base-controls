import { AgGridReact } from '@ag-grid-community/react';
import { MessageBar, MessageBarType, useTheme } from "@fluentui/react";
import { ColDef, ColumnResizedEvent, GridApi, GridState, ModuleRegistry, SelectionChangedEvent } from "@ag-grid-community/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGridInstance } from "../../hooks/useGridInstance";
import { getGridStyles } from "./styles";
import { Paging } from "../../../paging/components/Paging/Paging";
import { EmptyRecords } from "./components/EmptyRecordsOverlay/EmptyRecords";
import { Save } from "../Save/Save";
import { LoadingOverlay } from "./components/LoadingOverlay/LoadingOverlay";
import { IRecord } from '@talxis/client-libraries';
import { useDebouncedCallback } from 'use-debounce';
import { useGridController } from '../../controllers/useGridController';
import { useRerender, useStateValues } from '@talxis/react-components';
import { AgGrid as AgGridModel } from './model/AgGrid';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { AgGridContext } from './context';
import { IGrid } from '../../../interfaces';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
ModuleRegistry.registerModules([ClientSideRowModelModule]);


export const AgGrid = (props: IGrid) => {
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
    const records = grid.records;
    const userChangedColumnSizeRef = useRef(false);
    const rerender = useRerender();
    const innerRerenderRef = useRef(true);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);

    const debounceUpdateVisualSizeFactor = useDebouncedCallback((e: ColumnResizedEvent<IRecord, any>) => {
        if (e.source !== 'uiColumnResized') {
            return;
        }
        userChangedColumnSizeRef.current = true;
        agGrid.updateColumnVisualSizeFactor(e);
    }, 200);

    const debouncedRefresh = useDebouncedCallback(() => {
        agGrid.refresh();
    }, 0);

    if (!grid.isUpdateScheduled()) {
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

    const getCurrentContainerWidth = (): number => {
        return containerWidthRef.current ?? containerRef.current?.clientWidth
    }

    const onSelectionChanged = useDebouncedCallback((e: SelectionChangedEvent<any, any>) => {
        if (e.source.includes('api')) {
            return;
        }
        grid.dataset.setSelectedRecordIds(e.api.getSelectedNodes().map(node => node.data!.getRecordId()));
    }, 0);

    useEffect(() => {
        agGrid.toggleOverlay();
    }, [grid.loading]);


    useEffect(() => {
        //this can be replaced with native functionality if we decide to use ag grid enterprise
        grid.keyHoldListener.addOnKeyDownHandler((event) => agGrid.copyCellValue(event));

        agGrid.setRerenderCallback(() => {
            innerRerenderRef.current = true;
            rerender();
        });
        return () => {
            grid.pcfContext.mode.setControlState(getNewStateValues());
        }
    }, []);

    useEffect(() => {
        setAgColumns(agGrid.getColumns())
    }, [columns]);

    useEffect(() => {
        sizeColumnsIfSpaceAvailable()
    }, [agColumns]);

    innerRerenderRef.current = false;

    const componentProps = onOverrideComponentProps({
        container: {
            ref: containerRef,
            className: `${styles.root} ag-theme-balham`
        },
        pagingProps: {},
        registerRowGroupingModule: false,
        agGrid: {
            animateRows: false,
            rowSelection: grid.selection.type,
            noRowsOverlayComponent: Object.keys(grid.dataset.sortedRecordIds.length === 0) && !grid.loading ? EmptyRecords : undefined,
            loadingOverlayComponent: grid.loading ? LoadingOverlay : undefined,
            suppressDragLeaveHidesColumns: true,
            onColumnResized: (e) => debounceUpdateVisualSizeFactor(e),
            onColumnMoved: (e) => agGrid.updateColumnOrder(e),
            reactiveCustomComponents: true,
            //rowMultiSelectWithClick: true,
            onSelectionChanged: onSelectionChanged,
            gridOptions: {
                getRowStyle: (params) => {
                    return {
                        backgroundColor: agGrid.getDefaultCellTheme(params.node.childIndex % 2 === 0).semanticColors.bodyBackground
                    }
                },
            },
            onCellDoubleClicked: (e) => {
                if (grid.isNavigationEnabled && !grid.isEditable) {
                    grid.dataset.openDatasetItem(e.data!.getNamedReference())
                }
            },
            getRowId: (params) => params.data.getRecordId(),
            onGridReady: (e) => {
                gridApiRef.current = e.api as any;
                if (grid.loading) {
                    gridApiRef.current?.showLoadingOverlay();
                }
                onGridReady();
            },
            onGridSizeChanged: (e) => {
                containerWidthRef.current = e.clientWidth;
                sizeColumnsIfSpaceAvailable();
            },
            onFirstDataRendered: (e) => {
                sizeColumnsIfSpaceAvailable();
                agGrid.refreshRowSelection();
            },
            onCellEditingStopped: () => {
                grid.pcfContext.factory.requestRender();
            },
            initialState: stateValuesRef.current,
            onStateUpdated: (e) => stateValuesRef.current = {
                ...stateValuesRef.current,
                ...e.state
            },
            columnDefs: agColumns as any,
            rowData: records,
            getRowHeight: (params) => agGrid.getRowHeight(params.data!)
        }
    });

    useMemo(() => {
        if(componentProps.registerRowGroupingModule) {
            ModuleRegistry.register(RowGroupingModule);
        }
    }, []);

    return (
        <AgGridContext.Provider value={agGridProviderValue}>
            <div {...componentProps.container}>
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
                <AgGridReact {...componentProps.agGrid}>
                </AgGridReact>
                <Paging />
            </div>
        </AgGridContext.Provider>
    );
}
