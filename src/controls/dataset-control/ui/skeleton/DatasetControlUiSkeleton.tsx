import { IDatasetControlUiSkeletonComponents, DatasetControlUiSkeletonComponents } from "./components";
import { IDatasetControlUiSkeletonShimmerProps } from "./DatasetControlUiSkeletonShimmer";

/** Props for the placeholder shown while the control loads. */
export interface IDatasetControlUiSkeletonProps extends IDatasetControlUiSkeletonShimmerProps {
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiSkeletonComponents>;
}

/** What stands in for the control while it loads. */
export const DatasetControlUiSkeleton = (props: IDatasetControlUiSkeletonProps) => {
    const { components: componentsProp, ...shimmerProps } = props;
    const components = { ...DatasetControlUiSkeletonComponents, ...componentsProp };
    return components.onRender(shimmerProps);
};
