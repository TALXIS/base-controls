import { ISkeletonUiComponents, SkeletonUiComponents } from "./components";
import { ISkeletonShimmerProps } from "./SkeletonShimmer";

/** Props for the placeholder shown while the control loads. */
export interface ISkeletonUiProps extends ISkeletonShimmerProps {
    /** Replacements for its slots. */
    components?: Partial<ISkeletonUiComponents>;
}

/** What stands in for the control while it loads. */
export const Skeleton = (props: ISkeletonUiProps) => {
    const { components: componentsProp, ...shimmerProps } = props;
    const components = { ...SkeletonUiComponents, ...componentsProp };
    return components.onRenderSkeleton(shimmerProps);
};
