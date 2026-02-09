import { useEffect, useMemo, useRef } from "react";
import { GetRowIdParams, GridReadyEvent, GridState } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { AgGridModel } from "./ag-grid/AgGridModel";
import { AgGridReact } from "@ag-grid-community/react";
import { LoadingOverlay } from "../overlays/loading/LoadingOverlay";
import { EmptyRecords } from "../overlays/empty-records/EmptyRecordsOverlay";
import { getClassNames, ITheme, useStateValues } from "@talxis/react-components";
import { IGrid } from "../interfaces";
import { GridModel } from "./GridModel";
import { useControl } from "../../../hooks";
import { gridTranslations } from "../translations";
import { GridContext } from "./GridContext";
import { ThemeProvider } from "@fluentui/react";
import { getGridStyles } from "./styles";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { AgGridContext } from "./ag-grid/AgGridContext";

const getGridInstance = (onGetProps: () => IGrid, labels: any, theme: ITheme): GridModel => {
    return new GridModel({
        labels: labels,
        onGetProps: () => onGetProps(),
        theme: theme
    })
}

export const Grid = (props: IGrid) => {
    const { labels, theme, className } = useControl('Grid', props, gridTranslations);
    const propsRef = useRef<IGrid>(props);
    propsRef.current = props;
    const grid = useMemo(() => {
        return getGridInstance(() => propsRef.current, labels, theme)
    }, []);

    const styles = useMemo(() => getGridStyles(theme), [theme]);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridReadyRef = useRef<boolean>(false);
    const agGrid = useMemo(() => new AgGridModel({
        grid: grid,
        getContainer: () => containerRef.current!
    }), []);

    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);


    const onGridReady = (event: GridReadyEvent<IRecord, any>) => {
        agGrid.init(event.api);
        gridReadyRef.current = true;
    }

    useEffect(() => {
        return () => {
            grid.destroy();
        }
    }, []);

    const componentProps = onOverrideComponentProps({
        getRowId: (params: GetRowIdParams<IRecord>) => `${params.data.getRecordId()}`,
        rowModelType: 'serverSide' as const,
        //needs to be set here, crashes if set via API
        rowHeight: grid.getDefaultRowHeight(),
        rowSelection: agGrid.getSelectionType(),
        loadingOverlayComponent: LoadingOverlay,
        noRowsOverlayComponent: EmptyRecords,
        enableGroupEdit: true,
        reactiveCustomComponents: true,
        initialState: props.state?.[`${props.state?.DatasetControlState?.viewId}_agGridState`],
        gridOptions: {
            getRowStyle: (params) => {
                const record = params.data;
                if (!record) {
                    return undefined
                }
                return {
                    backgroundColor: grid.getDefaultCellTheme(record).semanticColors.bodyBackground,
                }
            },
        },
        onGridReady: onGridReady,
    })

    return <GridContext.Provider value={grid}>
        <AgGridContext.Provider value={agGrid}>
            <ThemeProvider
                className={getClassNames([className, styles.gridRoot, 'ag-theme-balham'])}
                ref={containerRef}
            >
                <AgGridReact
                    {...componentProps}
                />
            </ThemeProvider>
        </AgGridContext.Provider>
    </GridContext.Provider>
}
