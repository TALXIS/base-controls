import { FormV2UiSkeletonComponents, IFormV2UiSkeletonComponents } from "./components";
import { IFormV2UiSkeletonShimmerProps } from "./SkeletonShimmer";

/** Props for the placeholder shown while the form loads. */
export interface IFormV2UiSkeletonProps extends IFormV2UiSkeletonShimmerProps {
    /** Replacements for its slots. */
    components?: Partial<IFormV2UiSkeletonComponents>;
}

/** What stands in for the form while it loads. */
export const FormV2UiSkeleton = (props: IFormV2UiSkeletonProps) => {
    const { components: componentsProp, ...shimmerProps } = props;
    const components = { ...FormV2UiSkeletonComponents, ...componentsProp };
    return components.onRender(shimmerProps);
};
