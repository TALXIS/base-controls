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
    const styles = useMemo(
        () => getGridStyles(theme, props.height, rowHeight, settings.getMaxVisibleRows()),
        [theme, props.height, rowHeight]
    );

    useGridEventHandlers(runtime, props);

    //a part listening ahead of AG Grid needs this element, and it exists only once mounted
    const onGridRootRef = useCallback((gridRoot: HTMLDivElement | null) => {
        if (gridRoot) {
            runtime.services.register('gridRoot', () => gridRoot);
        }
    }, [runtime]);

    //AgGridReact is a child, so its teardown - and the `onDestroy` it fires - runs before this.
    useEffect(() => () => runtime.destroy(), []);

    //one context: everything a component needs is in the locator, `grid` included.
    return <GridServicesContext.Provider value={runtime.services}>
        <ThemeProvider
            theme={theme}
            //a cell may be drawn in colours of its own, but what it opens is drawn over the grid
            surfaceTheme={theme}
            applyTo='none'
            ref={onGridRootRef}
            className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot, 'ag-theme-balham'])}>
            <AgGridReact<IRecord> {...runtime.getAgGridProps()} />
            <Surfaces />
        </ThemeProvider>
    </GridServicesContext.Provider>
}
