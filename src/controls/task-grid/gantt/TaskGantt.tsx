import { useTheme } from "@theme";
import { Fragment, useEffect, useMemo, useRef } from "react";

import type { Dayjs } from "dayjs";
import { useControlStateStore, useEventEmitter, useLatest, useRerender } from "@core";
import { useLabelsService } from "@labels";
import { useOptionalDatasetControlInternal } from "@controls/dataset-control/adapters/root";
import { RuntimeHost, useProvidePart, useRuntime } from "@controls/runtime-host";
import { useTaskRuntime } from "../adapters/root/context";
import { GanttRuntime } from "./runtime";
import { GanttContext } from "./context";
import type { IGantt, IGanttEvents, IGanttModule } from "./interfaces";
import type { IGanttThemeEvents } from "./theme";
import { GanttOverlayLayer } from "./adapters/overlay";
import { GanttSkeletonLayer } from "./adapters/skeleton";
import { GanttUiChart, IGanttUiChartComponents } from "./ui/chart";
import type { IGanttUiOverlayComponents } from "./ui/overlay";
import { GanttUiSkeleton, IGanttUiSkeletonComponents } from "./ui/skeleton";
import { getTaskGanttStyles } from "./styles";

export interface ITaskGanttProps {
    /** Read once, at mount; must include a library module. */
    modules: IGanttModule[];
    /** Where the zoom is kept per view, read once at mount. */
    stateKey?: string;
    /** How far the timeline scrolls (default today ± 25 years), widened to fit the tasks. */
    timelineLimits?: { start?: Dayjs; end?: Dayjs };
    components?: ITaskGanttComponents;
    /** Called with the runtime of each mount, before its init; add hooks and subscribe here. */
    onSetup?: (gantt: IGantt) => void;
    /** Called once per mount when the control has loaded and is drawn. */
    onReady?: (gantt: IGantt) => void;
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
    const labelsServiceRef = useLatest(useLabelsService());
    const styles = useMemo(() => getTaskGanttStyles(), []);

    const createRuntime = () => new GanttRuntime({ taskRuntime, state, getLabelsService: () => labelsServiceRef.current, getProps: () => propsRef.current });
    const placeholder = { onRender: () => <GanttUiSkeleton components={props.components?.skeleton} /> };

    return <RuntimeHost<GanttRuntime> createRuntime={createRuntime} onSetup={gantt => propsRef.current.onSetup?.(gantt)} onReady={gantt => propsRef.current.onReady?.(gantt)} className={styles.runtime} components={{ placeholder }}>
        <GanttMount {...props} />
    </RuntimeHost>;
};

/** One mount of the Gantt: the chart, drawn once its modules have loaded. */
const GanttMount = (props: ITaskGanttProps) => {
    const runtime = useRuntime<GanttRuntime>();
    const gantt = useProvidePart(useOptionalDatasetControlInternal(), 'gantt', () => runtime);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const { rerender } = useRerender();
    const isChartReady = !!gantt.services.find('chart');
    const stylesVersion = gantt.theme.getVersion();
    const moduleStyles = useMemo(() => gantt.theme.getStyles(theme), [theme, stylesVersion]);

    useEventEmitter<IGanttEvents>(gantt.events, 'onChartReady', rerender);
    useEventEmitter<IGanttThemeEvents>(gantt.theme.events, 'onStylesChanged', rerender);

    useEffect(() => gantt.mount(containerRef.current!), []);

    return <GanttContext.Provider value={gantt}>
        <GanttUiChart chartRef={containerRef} moduleStyles={moduleStyles} components={props.components?.chart}>
            {isChartReady && gantt.surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
            <GanttOverlayLayer components={props.components?.overlay} />
            <GanttSkeletonLayer components={props.components?.skeleton} />
        </GanttUiChart>
    </GanttContext.Provider>;
};
