import * as React from "react";
import { ErrorMessageBar, IErrorMessageBarComponents, IErrorMessageBarLabels } from "@ui/error-message-bar";
import { readError } from "./readError";

export interface IErrorBoundaryProps {
    children?: React.ReactNode;
    /** Drawn in place of the children while set, over anything they threw. */
    error?: unknown;
    /** Adds *Try again* to a passed `error`; a caught render error always remounts the children. */
    onRetry?: () => void;
    labels?: Partial<IErrorMessageBarLabels>;
    components?: Partial<IErrorMessageBarComponents>;
}

interface IErrorBoundaryState {
    //wrapped, so a thrown `undefined` is still caught
    caught?: { exception: unknown };
}

/** Draws an error in place of its children: the one passed in, or one they threw while rendering. */
export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    public state: IErrorBoundaryState = {};

    public static getDerivedStateFromError(exception: unknown): IErrorBoundaryState {
        return { caught: { exception } };
    }

    public render(): React.ReactNode {
        if (this.props.error !== undefined) {
            return this._renderError(this.props.error, this.props.onRetry);
        }
        if (this.state.caught) {
            return this._renderError(this.state.caught.exception, this._onRetryCaught);
        }
        return this.props.children;
    }

    private _renderError(exception: unknown, onRetry?: () => void): React.ReactNode {
        const { title, details } = readError(exception);
        return <ErrorMessageBar title={title} details={details} onRetry={onRetry} labels={this.props.labels} components={this.props.components} />;
    }

    //the children were unmounted when they threw, so clearing the error mounts them anew
    private _onRetryCaught = (): void => {
        this.setState({ caught: undefined });
    };
}
