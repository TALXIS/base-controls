import { useTheme } from "@theme";
import { useCallback, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { IRecord } from "@talxis/client-libraries";

import { useControlStateStore } from "@controls/dataset-control/adapters/root/useControlStateStore";
import { useDatasetControlRuntime } from "@controls/dataset-control/adapters/root/context";
import { useRegisterDatasetControlPart } from "@controls/dataset-control/adapters/root/useRegisterDatasetControlPart";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { BaseControls, usePcfContext } from "@pcf";
import { getClassNames, useLatest } from "@core";
import { useLabelsService } from "@labels";
import { useDataProvider } from "@data";
import { registerBaseControl } from "@fields";
import { IGridProps } from "./interfaces";
import { GridRuntime } from "./runtime/grid";
import { useGridEventHandlers } from "./useGridEventHandlers";
import { getGridStyles } from "./styles";
import { GridComponentsContext, GridServicesContext } from "./context";
import { IGridComponents } from "./components";
import { Surfaces } from "./adapters/surfaces";
import { GridValueRenderer } from "./adapters/value-renderer";
import { GridInlineRibbon } from "./adapters/inline-ribbon";

//NestedControlRenderer finds the grid's own controls by name
registerBaseControl(BaseControls.GridValueRenderer, GridValueRenderer);
registerBaseControl(BaseControls.GridInlineRibbon, GridInlineRibbon);

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

    const onCreate = () => new GridRuntime({
        onGetProps: () => propsRef.current,
        provider,
        pcfContext,
        theme,
        state,
        datasetControl,
        onGetLabelsService: () => labelsServiceRef.current,
    });

    return <RuntimeHost<GridRuntime> onCreate={onCreate} onSetup={grid => propsRef.current.onSetup?.(grid)}>
        <GridMount {...props} />
    </RuntimeHost>;
};

/** One mount of the grid: AG Grid, drawn once the modules have loaded. */
const GridMount = (props: IGridProps) => {
    const runtime = useRuntime<GridRuntime>();
    //registered before AG Grid reads its initial options below, so the control's modules add to them
    useRegisterDatasetControlPart('grid', () => runtime);
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

    //the locator holds everything a component needs
    return <GridServicesContext.Provider value={runtime.services}>
        <GridComponentsContext.Provider value={components}>
            <div ref={onGridRootRef} className={getClassNames([GRID_CLASS_NAME, props.className, styles.gridRoot])}>
                <AgGridReact<IRecord> theme={runtime.services.get('gridTheme').getAgTheme()} {...runtime.getAgGridProps()} />
                <Surfaces />
            </div>
        </GridComponentsContext.Provider>
    </GridServicesContext.Provider>;
};
