import { useCallback, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { IRecord } from "@talxis/client-libraries";
import { useTheme } from "@fluentui/react";
import { useControlStateStore } from "@controls/dataset-control/components/adapters/root/useControlStateStore";
import { useDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import { useDatasetControlPart } from "@controls/dataset-control/components/adapters/root/useDatasetControlPart";
import { getClassNames, useDataProvider, useLocalization, usePcfContext, ThemeProvider } from "@utils";
import { IGridProps } from "./interfaces";
import { GridRuntime } from "./services/runtime";
import { useGridEventHandlers } from "./useGridEventHandlers";
import { getGridStyles } from "./styles";
import { GridComponentsContext, GridServicesContext } from "./context";
import { IGridComponents } from "./components/components";
import { Surfaces } from "./components/surfaces";
import { useLatest } from "@hooks";

const GRID_CLASS_NAME = 'talxis__baseControl__Grid';


const NO_COMPONENTS: IGridComponents = {};
/** Reads the PCF context off `PcfContextProvider` and the provider off `DataProviderContext`. */
export const GridRoot = (props: IGridProps) => {
    const pcfContext = usePcfContext();
    const provider = useDataProvider();
    const theme = useTheme();
    const state = useControlStateStore(props.stateKey);
    const datasetControl = useDatasetControlRuntime();
    const localization = useLocalization();
    const propsRef = useLatest(props);

    const runtime = useDatasetControlPart('grid', () => new GridRuntime({
        onGetProps: () => propsRef.current,
        provider: provider,
        pcfContext: pcfContext,
        theme: theme,
        state: state,
        datasetControl: datasetControl,
        localization: localization,
    }));

    const settings = runtime.services.get('settings');
    const rowHeight = settings.getDefaultRowHeight();
    const maxVisibleRows = settings.getMaxVisibleRows();
    const height = settings.getHeight();
    const styles = useMemo(() => getGridStyles(runtime.services.get('gridTheme').getStyles(), height, rowHeight, maxVisibleRows), [height, rowHeight, maxVisibleRows]);

    const components = props.components ?? NO_COMPONENTS;

    useGridEventHandlers(runtime, props);

    //parts listening ahead of AG Grid need this element once it is mounted
    const onGridRootRef = useCallback((gridRoot: HTMLDivElement | null) => {
        if (gridRoot) {
            runtime.services.register('gridRoot', () => gridRoot);
        }
    }, [runtime]);

    //`domLayout` follows whether the grid has a height
    useEffect(() => runtime.refreshAgGridOptions(), [height]);

    //AG Grid's teardown and its `onDestroyed` run before this cleanup
    useEffect(() => () => runtime.destroy(), []);

    //the locator holds everything a component needs
    return <GridServicesContext.Provider value={runtime.services}>
        <GridComponentsContext.Provider value={components}>
            <ThemeProvider
                theme={theme}
                //what a cell opens is drawn over the grid
                surfaceTheme={theme}
                applyTo='none'
                ref={onGridRootRef}
                className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot])}>
                <AgGridReact<IRecord> theme={runtime.services.get('gridTheme').getAgTheme()} {...runtime.getAgGridProps()} />
                <Surfaces />
            </ThemeProvider>
        </GridComponentsContext.Provider>
    </GridServicesContext.Provider>
}
