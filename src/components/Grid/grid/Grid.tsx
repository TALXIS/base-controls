import { useMemo, useRef } from "react";
import { GetRowIdParams, GridReadyEvent } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { AgGridModel } from "./ag-grid/AgGridModel";
import { AgGridReact } from "@ag-grid-community/react";
import { LoadingOverlay } from "../overlays/loading/LoadingOverlay";
import { EmptyRecords } from "../overlays/empty-records/EmptyRecordsOverlay";
import { getClassNames, ITheme } from "@talxis/react-components";
import { IGrid } from "../interfaces";
import { GridModel } from "./GridModel";
import { useControl } from "../../../hooks";
import { gridTranslations } from "../translations";
import { GridContext } from "./GridContext";
import { ThemeProvider } from "@fluentui/react";
import { getGridStyles } from "./styles";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { useDebouncedCallback } from "use-debounce";

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

    const debouncedRefresh = useDebouncedCallback(() => agGrid.refresh(), 0);

    if(gridReadyRef.current) {
        debouncedRefresh();
    }


    const onGridReady = (event: GridReadyEvent<IRecord, any>) => {
        agGrid.init(event.api);
        gridReadyRef.current = true;
    }


    return <GridContext.Provider value={grid}>
        <ThemeProvider
            className={getClassNames([className, styles.gridRoot, 'ag-theme-balham'])}
            ref={containerRef}
        >
            <AgGridReact
                animateRows={false}
                getRowId={(params: GetRowIdParams<IRecord>) => `${params.data.getRecordId()}_${params.data.getIndex()}`}
                rowModelType='serverSide'
                suppressCopyRowsToClipboard
                groupDisplayType="custom"
                rowSelection={agGrid.getSelectionType()}
                loadingOverlayComponent={LoadingOverlay}
                noRowsOverlayComponent={EmptyRecords}
                reactiveCustomComponents
                gridOptions={{
                    getRowStyle: (params) => {
                        const record = params.data;
                        if (!record) {
                            return undefined
                        }
                        return {
                            backgroundColor: grid.getDefaultCellTheme(record.getIndex() % 2 === 0).semanticColors.bodyBackground
                        }
                    },
                }}
                onGridReady={onGridReady}
            />
        </ThemeProvider>
    </GridContext.Provider>
}
