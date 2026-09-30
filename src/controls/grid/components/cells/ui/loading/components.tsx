import { IShimmerProps } from "@fluentui/react";
import { Shimmer } from "@ui";

/** The replaceable pieces of what a cell shows while it waits. */
export interface ICellUiLoadingComponents {
    onRenderShimmer: (props: IShimmerProps) => JSX.Element | null;
}

/** The defaults for {@link ICellUiLoadingComponents}. */
export const CellUiLoadingComponents: ICellUiLoadingComponents = {
    onRenderShimmer: props => <Shimmer {...props} />,
};
