import { IShimmerProps, Shimmer } from "@ui/shimmer";

/** The replaceable pieces of the ribbon's shimmer. */
export interface IRibbonShimmerUiComponents {
    /** The placeholder drawn in place of the commands. */
    onRenderShimmer: (props: IShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IRibbonShimmerUiComponents}. */
export const RibbonShimmerUiComponents: IRibbonShimmerUiComponents = {
    onRenderShimmer: props => <Shimmer {...props} />,
};
