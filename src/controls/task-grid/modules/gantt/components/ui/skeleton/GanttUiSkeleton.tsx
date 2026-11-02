import { useMemo } from "react";
import type { IGanttUiSkeletonShimmerProps } from "../skeleton-shimmer";
import { GanttUiSkeletonComponents, IGanttUiSkeletonComponents } from "./components";
import { getGanttUiSkeletonStyles } from "./styles";

export interface IGanttUiSkeletonProps extends IGanttUiSkeletonShimmerProps {
    components?: Partial<IGanttUiSkeletonComponents>;
}

/** What stands in for the Gantt while it loads, laid over the chart. */
export const GanttUiSkeleton = (props: IGanttUiSkeletonProps) => {
    const { components: componentsProp, ...shimmerProps } = props;
    const components = { ...GanttUiSkeletonComponents, ...componentsProp };
    const styles = useMemo(() => getGanttUiSkeletonStyles(), []);

    return components.onRenderContainer({ className: styles.root, children: components.onRenderSkeleton(shimmerProps) });
};
