import { IDatasetControlUiSkeletonShimmerProps, DatasetControlUiSkeletonShimmer } from "./DatasetControlUiSkeletonShimmer";

/** The replaceable pieces of the skeleton. */
export interface IDatasetControlUiSkeletonComponents {
    /** The placeholder itself. */
    onRenderSkeleton: (props: IDatasetControlUiSkeletonShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiSkeletonComponents}. */
export const DatasetControlUiSkeletonComponents: IDatasetControlUiSkeletonComponents = {
    onRenderSkeleton: props => <DatasetControlUiSkeletonShimmer {...props} />,
};
