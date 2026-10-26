import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useGantt } from "../../../context";
import type { IGanttEvents } from "../../../interfaces";
import { GanttSkeleton, IGanttSkeletonUiComponents } from "../../ui/skeleton";

export interface IGanttSkeletonLayerProps {
    components?: Partial<IGanttSkeletonUiComponents>;
}

/** Covers the chart with the skeleton until it is drawn, which waits for the modules and the grid. */
export const GanttSkeletonLayer = (props: IGanttSkeletonLayerProps) => {
    const gantt = useGantt();
    const { rerender } = useRerender();

    useEventEmitter<IGanttEvents>(gantt.events, 'onChartReady', rerender);

    return gantt.services.find('chart') ? null : <GanttSkeleton components={props.components} />;
};
