import { ISpinnerProps, ITextProps, Text } from "@fluentui/react";
import { Spinner } from "@legacy";

/** The replaceable pieces of the spinner over the grid. */
export interface IOverlayUiLoadingComponents {
    /** What the spinner and the message are drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What says the grid is loading. */
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element | null;
    /** What is being waited on, drawn only when there is a message. */
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link IOverlayUiLoadingComponents}. */
export const OverlayUiLoadingComponents: IOverlayUiLoadingComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderSpinner: props => <Spinner {...props} />,
    onRenderText: props => <Text {...props} />,
};
