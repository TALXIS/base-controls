import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@fluentui/react";
import type { Dayjs } from "dayjs";
import { useEventEmitter, useLatest } from "@hooks";
import { useRerender } from "@legacy";
import { useLabelsService } from "@utils";
import { useControlStateStore, useDatasetControlPart } from "@controls/dataset-control/components/adapters/root";
import { useTaskRuntime } from "../../dataset-control/context";
import { GanttRuntime } from "./runtime";
import { GanttContext } from "./context";
import type { IGanttEvents, IGanttModule } from "./interfaces";
import type { IGanttThemeEvents } from "./theme";
import { GanttOverlayLayer } from "./components/adapters/overlay";
import { GanttSkeletonLayer } from "./components/adapters/skeleton";
import { GanttUiChart, IGanttUiChartComponents } from "./components/ui/chart";
import type { IGanttUiOverlayComponents } from "./components/ui/overlay";
import type { IGanttUiSkeletonComponents } from "./components/ui/skeleton";

export interface ITaskGanttProps {
    /** Read once, at mount. */
    modules?: IGanttModule[];
    /** Where the zoom is kept per view, read once at mount. */
    stateKey?: string;
    /** How far the timeline scrolls (default today ± 25 years), widened to fit the tasks. */
    timelineLimits?: { start?: Dayjs; end?: Dayjs };
    components?: ITaskGanttComponents;
}

/** The replaceable pieces of the Gantt, by the part they belong to. */
export interface ITaskGanttComponents {
    /** The area the chart is drawn into. */
    chart?: Partial<IGanttUiChartComponents>;
    /** The cover the `overlay` service shows over the chart. */
    overlay?: Partial<IGanttUiOverlayComponents>;
    /** What covers the chart until it is drawn. */
    skeleton?: Partial<IGanttUiSkeletonComponents>;
}

/** The tasks of a `TaskDatasetControl` on a timeline, row for row with the `TaskGrid`. */
export const TaskGanttRoot = (props: ITaskGanttProps) => {
    const taskRuntime = useTaskRuntime();
    const state = useControlStateStore(props.stateKey);
    const propsRef = useLatest(props);
    const labelsService = useLabelsService();
    const gantt = useDatasetControlPart('gantt', () => new GanttRuntime({ taskRuntime, state, labelsService, onGetProps: () => propsRef.current }));
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const [error, setError] = useState<unknown>();
    const { rerender } = useRerender();
    const isChartReady = !!gantt.services.find('chart');
    const stylesVersion = gantt.theme.getVersion();
    const moduleStyles = useMemo(() => gantt.theme.getStyles(theme), [theme, stylesVersion]);

    useEventEmitter<IGanttEvents>(gantt.events, 'onChartReady', rerender);
    useEventEmitter<IGanttThemeEvents>(gantt.theme.events, 'onStylesChanged', rerender);

    useEffect(() => {
        const mount = async () => {
            try {
                await gantt.mount(containerRef.current!);
            }
            catch (error) {
                setError(error);
            }
        };
        mount();
        return () => gantt.destroy();
    }, []);

    if (error) {
        throw error;
    }
    return <GanttContext.Provider value={gantt}>
        <GanttUiChart chartRef={containerRef} moduleStyles={moduleStyles} components={props.components?.chart}>
            {isChartReady && gantt.surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
            <GanttOverlayLayer components={props.components?.overlay} />
            <GanttSkeletonLayer components={props.components?.skeleton} />
        </GanttUiChart>
    </GanttContext.Provider>;
};
