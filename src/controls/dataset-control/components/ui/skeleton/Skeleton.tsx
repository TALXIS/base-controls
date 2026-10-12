import { ISkeletonUiComponents, SkeletonUiComponents } from "./components";
import { ISkeletonShimmerProps } from "./SkeletonShimmer";

export interface ISkeletonUiProps extends ISkeletonShimmerProps {
    components?: Partial<ISkeletonUiComponents>;
}

/** What stands in for the control while it loads. */
export const Skeleton = (props: ISkeletonUiProps) => {
    const { components: componentsProp, ...shimmerProps } = props;
    const components = { ...SkeletonUiComponents, ...componentsProp };
    return components.onRenderSkeleton(shimmerProps);
};
