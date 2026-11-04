import { IShimmerProps, Shimmer } from "@ui";

/** The replaceable pieces of a row that is loading. */
export interface IRowUiLoadingComponents {
    /** What stands in for the row until its records arrive. */
    onRenderShimmer: (props: IShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link IRowUiLoadingComponents}. */
export const RowUiLoadingComponents: IRowUiLoadingComponents = {
    onRenderShimmer: props => <Shimmer {...props} />,
};
