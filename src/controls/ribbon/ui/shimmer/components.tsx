import { IShimmerProps, Shimmer } from "@ui/shimmer";

/** The replaceable pieces of the ribbon's shimmer. */
export interface IRibbonUiShimmerComponents {
    /** The placeholder drawn in place of the commands. */
    onRender: (props: IShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IRibbonUiShimmerComponents}. */
export const RibbonUiShimmerComponents: IRibbonUiShimmerComponents = {
    onRender: props => <Shimmer {...props} />,
};
