import { useMemo } from "react";
import { GanttSkeletonUiComponents, IGanttSkeletonUiComponents } from "./components";
import { IGanttSkeletonShimmerProps } from "./GanttSkeletonShimmer";
import { getGanttSkeletonStyles } from "./styles";

export interface IGanttSkeletonProps extends IGanttSkeletonShimmerProps {
    components?: Partial<IGanttSkeletonUiComponents>;
}

/** What stands in for the Gantt while it loads, laid over the chart. */
export const GanttSkeleton = (props: IGanttSkeletonProps) => {
    const { components: componentsProp, ...shimmerProps } = props;
    const components = { ...GanttSkeletonUiComponents, ...componentsProp };
    const styles = useMemo(() => getGanttSkeletonStyles(), []);

    return <div className={styles.root}>
        {components.onRenderSkeleton(shimmerProps)}
    </div>;
};
