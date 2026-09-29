import { useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { useTheme } from "@fluentui/react";
import { getClassNames, usePcfContext, ThemeProvider } from "@utils";
import { IGrid } from "./interfaces";
import { GridRuntime } from "./services/runtime";
import { useGridEventHandlers } from "./useGridEventHandlers";
import { getGridStyles } from "./styles";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { GridServicesContext } from "./context";
import { Surfaces } from "./components/surfaces";

const GRID_CLASS_NAME = 'talxis__baseControl__Grid';

/** Reads the PCF context off `PcfContextProvider`. */
export const GridRoot = (props: IGrid) => {
    const pcfContext = usePcfContext();
    const theme = useTheme();
    const propsRef = useRef<IGrid>(props);
    propsRef.current = props;

    const runtime = useMemo(() => new GridRuntime({
        onGetProps: () => propsRef.current,
        pcfContext: pcfContext,
        theme: theme,
    }), []);

    const settings = runtime.services.get('settings');
    const rowHeight = settings.getDefaultRowHeight();
    const maxVisibleRows = settings.getMaxVisibleRows();
    const styles = useMemo(() => getGridStyles(theme, props.height, rowHeight, maxVisibleRows), [theme, props.height, rowHeight, maxVisibleRows]
    );

    useGridEventHandlers(runtime, props);

    //parts listening ahead of AG Grid need this element once it is mounted
    const onGridRootRef = useCallback((gridRoot: HTMLDivElement | null) => {
        if (gridRoot) {
            runtime.services.register('gridRoot', () => gridRoot);
        }
    }, [runtime]);

    //AG Grid's teardown and its `onDestroy` run before this cleanup
    useEffect(() => () => runtime.destroy(), []);

    //the locator holds everything a component needs
    return <GridServicesContext.Provider value={runtime.services}>
        <ThemeProvider
            theme={theme}
            //what a cell opens is drawn over the grid
            surfaceTheme={theme}
            applyTo='none'
            ref={onGridRootRef}
            className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot, 'ag-theme-balham'])}>
            <AgGridReact<IRecord> {...runtime.getAgGridProps()} />
            <Surfaces />
        </ThemeProvider>
    </GridServicesContext.Provider>
}
