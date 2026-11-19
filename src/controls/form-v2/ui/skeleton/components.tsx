import { FormV2UiSkeletonShimmer, IFormV2UiSkeletonShimmerProps } from "./SkeletonShimmer";

/** The replaceable pieces of the skeleton. */
export interface IFormV2UiSkeletonComponents {
    /** The placeholder itself. */
    onRender: (props: IFormV2UiSkeletonShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IFormV2UiSkeletonComponents}. */
export const FormV2UiSkeletonComponents: IFormV2UiSkeletonComponents = {
    onRender: props => <FormV2UiSkeletonShimmer {...props} />,
};
