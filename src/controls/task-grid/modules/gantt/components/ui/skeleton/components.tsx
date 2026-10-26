import { GanttSkeletonShimmer, IGanttSkeletonShimmerProps } from "./GanttSkeletonShimmer";

/** The replaceable pieces of the Gantt's skeleton. */
export interface IGanttSkeletonUiComponents {
    /** The placeholder itself. */
    onRenderSkeleton: (props: IGanttSkeletonShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IGanttSkeletonUiComponents}. */
export const GanttSkeletonUiComponents: IGanttSkeletonUiComponents = {
    onRenderSkeleton: props => <GanttSkeletonShimmer {...props} />,
};
