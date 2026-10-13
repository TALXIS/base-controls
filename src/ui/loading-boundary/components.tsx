import { ISpinnerProps, ITextProps, Spinner, Text } from "@fluentui/react";

/** The replaceable pieces of the loading boundary. */
export interface ILoadingBoundaryComponents {
    /** Drawn in place of the children while loading; its `children` are the spinner and the text. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The spinner. */
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element | null;
    /** The text beside the spinner; its `children` are the `loading` label. */
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link ILoadingBoundaryComponents}. */
export const LoadingBoundaryComponents: ILoadingBoundaryComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderSpinner: props => <Spinner {...props} />,
    onRenderText: props => <Text {...props} />,
};
