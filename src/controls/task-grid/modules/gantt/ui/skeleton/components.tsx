import { GanttUiSkeletonShimmer, IGanttUiSkeletonShimmerProps } from "../skeleton-shimmer";

/** The replaceable pieces of the Gantt's skeleton. */
export interface IGanttUiSkeletonComponents {
    /** Holds the placeholder, laid over the chart. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The placeholder itself. */
    onRenderSkeleton: (props: IGanttUiSkeletonShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IGanttUiSkeletonComponents}. */
export const GanttUiSkeletonComponents: IGanttUiSkeletonComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderSkeleton: props => <GanttUiSkeletonShimmer {...props} />,
};
