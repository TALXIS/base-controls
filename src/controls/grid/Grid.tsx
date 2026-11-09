import { useTheme } from "@theme";
import { useCallback, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { IRecord } from "@talxis/client-libraries";

import { useOptionalDatasetControlInternal } from "@controls/dataset-control/adapters/root/context";
import { useProvideDatasetControlPart } from "@controls/dataset-control/adapters/root/useProvideDatasetControlPart";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { BaseControls, usePcfContext } from "@pcf";
import { getClassNames, useControlStateStore, useLatest } from "@core";
import { useLabelsService } from "@labels";
import { useDataProvider } from "@data";
import { defineBaseControl } from "@fields";
import { IGridProps } from "./interfaces";
import { GridRuntime } from "./runtime/grid";
import { getGridStyles } from "./styles";
import { GridComponentsContext, GridServicesContext } from "./context";
import { IGridComponents } from "./components";
import { Surfaces } from "./adapters/surfaces";
import { GridValueRenderer } from "./adapters/value-renderer";
import { GridInlineRibbon } from "./adapters/inline-ribbon";

//NestedControlRenderer finds the grid's own controls by name
defineBaseControl(BaseControls.GridValueRenderer, GridValueRenderer);
defineBaseControl(BaseControls.GridInlineRibbon, GridInlineRibbon);

const GRID_CLASS = 'talxis__baseControl__Grid';


const NO_COMPONENTS: IGridComponents = {};
/** Reads the PCF context off `PcfContextProvider` and the provider off `DataProviderContext`. */
export const GridRoot = (props: IGridProps) => {
    const pcfContext = usePcfContext();
    const provider = useDataProvider();
    const theme = useTheme();
    const state = useControlStateStore(props.stateKey);
    const datasetControl = useOptionalDatasetControlInternal();
    const labelsServiceRef = useLatest(useLabelsService());
    const propsRef = useLatest(props);

    const createRuntime = () => new GridRuntime({
        getProps: () => propsRef.current,
        provider,
        pcfContext,
        theme,
        state,
        datasetControl,
        getLabelsService: () => labelsServiceRef.current,
    });

    return <RuntimeHost<GridRuntime> createRuntime={createRuntime} onSetup={grid => propsRef.current.onSetup?.(grid)}>
        <GridMount {...props} />
    </RuntimeHost>;
};

/** One mount of the grid: AG Grid, drawn once the modules have loaded. */
const GridMount = (props: IGridProps) => {
    const runtime = useRuntime<GridRuntime>();
    //provided before AG Grid reads its initial options below, so the control's modules add to them
    useProvideDatasetControlPart('grid', () => runtime);
    const settings = runtime.services.get('settings');
    const rowHeight = settings.getDefaultRowHeight();
    const maxVisibleRows = settings.getMaxVisibleRows();
    const height = settings.getHeight();
    const styles = useMemo(() => getGridStyles(runtime.services.get('gridTheme').getStyles(), height, rowHeight, maxVisibleRows), [height, rowHeight, maxVisibleRows]);

    const components = props.components ?? NO_COMPONENTS;

    //parts listening ahead of AG Grid need this element once it is mounted
    const onGridRootRef = useCallback((gridRoot: HTMLDivElement | null) => {
        if (gridRoot) {
            runtime.services.provide('gridRoot', gridRoot);
        }
    }, [runtime]);

    //`domLayout` follows whether the grid has a height
    useEffect(() => runtime.refreshAgGridOptions(), [height]);

    //the locator holds everything a component needs
    return <GridServicesContext.Provider value={runtime.services}>
        <GridComponentsContext.Provider value={components}>
            <div ref={onGridRootRef} className={getClassNames([GRID_CLASS, props.className, styles.gridRoot])}>
                <AgGridReact<IRecord> theme={runtime.services.get('gridTheme').getAgTheme()} {...runtime.getAgGridProps()} />
                <Surfaces />
            </div>
        </GridComponentsContext.Provider>
    </GridServicesContext.Provider>;
};
