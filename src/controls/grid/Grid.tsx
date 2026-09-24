import { useCallback, useEffect, useMemo, useRef } from "react";
import { GetRowIdParams } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { useTheme } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { LoadingOverlay } from "./components/overlays/loading/LoadingOverlay";
import { EmptyRecords } from "./components/overlays/empty-records/EmptyRecordsOverlay";
import { getClassNames, usePcfContext, ThemeProvider } from "@utils";
import { IGrid } from "./interfaces";
import { createGridInstance } from "./createGridInstance";
import { getGridStyles } from "./styles";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { GridServicesContext } from "./context";
import { Surfaces } from "./components/surfaces";
import { GridComponents } from "./components";

const GRID_CLASS_NAME = 'talxis__baseControl__Grid';

/** Reads the PCF context off `PcfContextProvider`. */
export const GridRoot = (props: IGrid) => {
    const pcfContext = usePcfContext();
    const theme = useTheme();
    const propsRef = useRef<IGrid>(props);
    propsRef.current = props;

    const { settings, services, initialComponentProps, destroy } = useMemo(() => createGridInstance({
        onGetProps: () => propsRef.current,
        pcfContext: pcfContext,
        theme: theme,
    }), []);

    const rowHeight = settings.getDefaultRowHeight();
    const styles = useMemo(
        () => getGridStyles(theme, props.height, rowHeight, settings.getMaxVisibleRows()),
        [theme, props.height, rowHeight]
    );

    //not memoized: a slot closes over the caller's own state
    const components = { ...GridComponents, ...props.components };

    //AgGridReact is a child, so its teardown - and the `onDestroy` it fires - runs before this.
    useEffect(() => {
        return () => {
            destroy();
            services.destroy();
        }
    }, []);

    const componentProps: AgGridReactProps<IRecord> = {
        //the modules first: the grid has the last word on anything it also sets
        ...initialComponentProps,
        getRowId: (params: GetRowIdParams<IRecord>) => `${params.data.getRecordId()}`,
        //needs to be set here, crashes if set via API
        rowHeight: rowHeight,
        loadingOverlayComponent: LoadingOverlay,
        noRowsOverlayComponent: EmptyRecords,
        enableGroupEdit: true,
        reactiveCustomComponents: true,
        initialState: props.state,
        //the api last: registering it builds the parts that push columns
        onGridReady: (event) => {
            propsRef.current.onGridReady?.(event.api);
            services.register('gridApi', () => event.api);
        },
        //before AG Grid tears down, so `getState()` still answers for whoever wants to persist it
        onGridPreDestroyed: (event) => propsRef.current.onDestroy?.(event.api),
    }

    //a part listening ahead of AG Grid needs this element, and it exists only once mounted
    const onGridRootRef = useCallback((gridRoot: HTMLDivElement | null) => {
        if (gridRoot) {
            services.register('gridRoot', () => gridRoot);
        }
    }, []);

    //one context: everything a component needs is in the locator, `grid` included.
    return <GridServicesContext.Provider value={services}>
        <ThemeProvider
            theme={theme}
            //a cell may be drawn in colours of its own, but what it opens is drawn over the grid
            surfaceTheme={theme}
            applyTo='none'
            ref={onGridRootRef}
            className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot, 'ag-theme-balham'])}>
            {components.onRenderAgGrid(componentProps)}
            <Surfaces />
        </ThemeProvider>
    </GridServicesContext.Provider>
}
