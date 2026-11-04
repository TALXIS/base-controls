import { useTheme } from "@theme";
import { useCallback, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { IRecord } from "@talxis/client-libraries";

import { useControlStateStore } from "../dataset-control/adapters/root/useControlStateStore";
import { useDatasetControlRuntime } from "../dataset-control/adapters/root/context";
import { useDatasetControlPart } from "../dataset-control/adapters/root/useDatasetControlPart";
import { getClassNames, useLabelsService, usePcfContext, useLatest } from "@core";
import { useDataProvider } from "@data";
import { IGridProps } from "./interfaces";
import { GridRuntime } from "./runtime/grid";
import { useGridEventHandlers } from "./useGridEventHandlers";
import { getGridStyles } from "./styles";
import { GridComponentsContext, GridServicesContext } from "./context";
import { IGridComponents } from "./components";
import { Surfaces } from "./adapters/surfaces";

const GRID_CLASS_NAME = 'talxis__baseControl__Grid';


const NO_COMPONENTS: IGridComponents = {};
/** Reads the PCF context off `PcfContextProvider` and the provider off `DataProviderContext`. */
export const GridRoot = (props: IGridProps) => {
    const pcfContext = usePcfContext();
    const provider = useDataProvider();
    const theme = useTheme();
    const state = useControlStateStore(props.stateKey);
    const datasetControl = useDatasetControlRuntime();
    const labelsServiceRef = useLatest(useLabelsService());
    const propsRef = useLatest(props);

    const runtime = useDatasetControlPart('grid', () => new GridRuntime({
        onGetProps: () => propsRef.current,
        provider: provider,
        pcfContext: pcfContext,
        theme: theme,
        state: state,
        datasetControl: datasetControl,
        onGetLabelsService: () => labelsServiceRef.current,
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
            <div ref={onGridRootRef} className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot])}>
                <AgGridReact<IRecord> theme={runtime.services.get('gridTheme').getAgTheme()} {...runtime.getAgGridProps()} />
                <Surfaces />
            </div>
        </GridComponentsContext.Provider>
    </GridServicesContext.Provider>
}
