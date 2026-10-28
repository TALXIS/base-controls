import { IOverlayProps, ISpinnerProps, ITextProps, Overlay, Text } from "@fluentui/react";
import { Spinner } from "@legacy";

/** The replaceable pieces of the loading overlay. */
export interface ILoadingOverlayComponents {
    /** What covers the children; its `children` are the spinner and the message. */
    onRenderOverlay: (props: IOverlayProps) => JSX.Element | null;
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element | null;
    /** What is being waited on, drawn only when there is a message. */
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link ILoadingOverlayComponents}. */
export const LoadingOverlayComponents: ILoadingOverlayComponents = {
    onRenderOverlay: props => <Overlay {...props} />,
    onRenderSpinner: props => <Spinner {...props} />,
    onRenderText: props => <Text {...props} />,
};
