import { ISkeletonShimmerProps, SkeletonShimmer } from "./SkeletonShimmer";

/** The replaceable pieces of the skeleton. */
export interface ISkeletonUiComponents {
    /** The placeholder itself. */
    onRenderSkeleton: (props: ISkeletonShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link ISkeletonUiComponents}. */
export const SkeletonUiComponents: ISkeletonUiComponents = {
    onRenderSkeleton: props => <SkeletonShimmer {...props} />,
};
