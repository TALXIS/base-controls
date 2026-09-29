import { IOverlayUiEmptyRecordsProps, IOverlayUiLoadingProps, OverlayUi } from "./overlays/ui";

/** The replaceable pieces of the grid itself. */
export interface IGridComponents {
    /** What the grid shows while it loads, `Grid.Overlay.Ui.Loading` by default. */
    onRenderLoadingOverlay: (props: IOverlayUiLoadingProps) => JSX.Element;
    /** What the grid shows while it has no rows, `Grid.Overlay.Ui.EmptyRecords` by default. */
    onRenderEmptyRecordsOverlay: (props: IOverlayUiEmptyRecordsProps) => JSX.Element;
}

/** The defaults for {@link IGridComponents}. */
export const GridComponents: IGridComponents = {
    onRenderLoadingOverlay: props => <OverlayUi.Loading {...props} />,
    onRenderEmptyRecordsOverlay: props => <OverlayUi.EmptyRecords {...props} />,
};
