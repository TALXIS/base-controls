import { IOverlayUiEmptyRecordsProps, IOverlayUiLoadingProps, OverlayUi } from "./overlays/ui";
import { IRowUiErrorProps, IRowUiLoadingProps, RowUi } from "./rows/ui";

/** The replaceable pieces of the grid itself. */
export interface IGridComponents {
    /** What the grid shows while it loads, `Grid.Overlay.Ui.Loading` by default. */
    onRenderLoadingOverlay: (props: IOverlayUiLoadingProps) => JSX.Element;
    /** What the grid shows while it has no rows, `Grid.Overlay.Ui.EmptyRecords` by default. */
    onRenderEmptyRecordsOverlay: (props: IOverlayUiEmptyRecordsProps) => JSX.Element;
    /** What a row shows while its records load, `Grid.Row.Ui.Loading` by default. */
    onRenderRowLoading: (props: IRowUiLoadingProps) => JSX.Element;
    /** What a row shows when its records failed, `Grid.Row.Ui.Error` by default. */
    onRenderRowError: (props: IRowUiErrorProps) => JSX.Element;
}

/** The defaults for {@link IGridComponents}. */
export const GridComponents: IGridComponents = {
    onRenderLoadingOverlay: props => <OverlayUi.Loading {...props} />,
    onRenderEmptyRecordsOverlay: props => <OverlayUi.EmptyRecords {...props} />,
    onRenderRowLoading: props => <RowUi.Loading {...props} />,
    onRenderRowError: props => <RowUi.Error {...props} />,
};
