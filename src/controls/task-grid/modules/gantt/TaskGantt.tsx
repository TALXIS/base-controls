import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@fluentui/react";
import { useEventEmitter, useLatest } from "@hooks";
import { useRerender } from "@legacy";
import { useControlStateStore, useDatasetControlPart } from "@controls/dataset-control/components/adapters/root";
import { useTaskRuntime } from "../../dataset-control/context";
import { GanttRuntime } from "./runtime/GanttRuntime";
import { GanttContext } from "./context";
import type { IGanttLabels } from "./labels";
import type { IGanttEvents, IGanttModule } from "./interfaces";
import { getTaskGanttStyles } from "./styles";
import { GanttOverlayLayer } from "./components/overlay-layer";
import { GanttSkeletonLayer } from "./components/adapters/skeleton";
import type { IGanttSkeletonUiComponents } from "./components/ui/skeleton";

export interface ITaskGanttProps {
    /** Read once, at mount. */
    modules?: IGanttModule[];
    /** Where the zoom is kept per view; read once, at mount. */
    stateKey?: string;
    /** Read once, at mount. */
    labels?: Partial<IGanttLabels>;
    components?: ITaskGanttComponents;
}

/** The replaceable pieces of the Gantt, by the part they belong to. */
export interface ITaskGanttComponents {
    /** What covers the chart until it is drawn. */
    skeleton?: Partial<IGanttSkeletonUiComponents>;
}

/** The tasks of a `TaskDatasetControl` on a timeline, row for row with the `TaskGrid` beside it. */
export const TaskGanttRoot = (props: ITaskGanttProps) => {
    const taskRuntime = useTaskRuntime();
    const state = useControlStateStore(props.stateKey);
    const propsRef = useLatest(props);
    const gantt = useDatasetControlPart('gantt', () => new GanttRuntime({ taskRuntime, state, onGetProps: () => propsRef.current }));
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const [error, setError] = useState<unknown>();
    const { rerender } = useRerender();
    const isChartReady = !!gantt.services.find('chart');
    //the modules register their styles as they load, which is before the chart is drawn
    const styles = useMemo(() => getTaskGanttStyles(theme, gantt.theme.getStyles(theme)), [theme, isChartReady]);

    useEventEmitter<IGanttEvents>(gantt.events, 'onChartReady', rerender);

    useEffect(() => {
        gantt.mount(containerRef.current!).catch(setError);
        return () => gantt.destroy();
    }, []);

    if (error) {
        throw error;
    }
    return <GanttContext.Provider value={gantt}>
        <div className={styles.root}>
            <div ref={containerRef} className={styles.chart} />
            {isChartReady && gantt.surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
            <GanttOverlayLayer />
            <GanttSkeletonLayer components={props.components?.skeleton} />
        </div>
    </GanttContext.Provider>;
};
