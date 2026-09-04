import { useEffect, useMemo, useRef } from "react";
import { GetRowIdParams } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { LoadingOverlay } from "../overlays/loading/LoadingOverlay";
import { EmptyRecords } from "../overlays/empty-records/EmptyRecordsOverlay";
import { getClassNames, usePcfContext, useControlTheme } from "@utils";
import { IGrid } from "../interfaces";
import { createGridInstance } from "./createGridInstance";
import { getGridStyles } from "./styles";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { GridServicesContext } from "./GridServicesContext";
import { GridComponents } from "./components";

const GRID_CLASS_NAME = 'talxis__baseControl__Grid';

/**
 * A grid over an {@link IDataProvider}.
 *
 * Reads the PCF context off `PcfContextProvider`, so render it inside one.
 */
export const Grid = (props: IGrid) => {
    const pcfContext = usePcfContext();
    const theme = useControlTheme(pcfContext.fluentDesignLanguage);
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

    //not memoized: a slot closes over the caller's own state, and freezing it at mount is how that goes stale
    const components = { ...GridComponents, ...props.components };

    //AgGridReact is a child, so its teardown - and the `onDestroy` it fires - runs before this. The locator
    //must not go first: the parts under it are what AG Grid is still talking to
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
        gridOptions: {
            getRowStyle: (params) => {
                const record = params.data;
                if (!record) {
                    return undefined;
                }
                return {
                    backgroundColor: services.get('theming').getCellTheme(record).semanticColors.bodyBackground,
                }
            },
        },
        //the caller first, then the api: registering it is what builds the parts that talk to AG Grid, and
        //the first thing they do is push columns - which a caller configuring those has to be ahead of
        onGridReady: (event) => {
            propsRef.current.onGridReady?.(event.api);
            services.register('gridApi', () => event.api);
        },
        //before AG Grid tears down, so `getState()` still answers for whoever wants to persist it
        onGridPreDestroyed: (event) => propsRef.current.onDestroy?.(event.api),
    }

    //one context: everything a component needs is in the locator, `grid` included
    return <GridServicesContext.Provider value={services}>
        <div className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot, 'ag-theme-balham'])}>
            {components.onRenderAgGrid(componentProps)}
        </div>
    </GridServicesContext.Provider>
}
