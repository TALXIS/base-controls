import * as React from "react";
import { readError } from "./readError";

/** An error as an `ErrorBoundary` hands it to its `fallback`. */
export interface IBoundaryError {
    title: string;
    details?: string;
    /** Set when the error can be retried. */
    onRetry?: () => void;
}

export interface IErrorBoundaryProps {
    children?: React.ReactNode;
    /** Drawn in place of the children while set, over anything they threw. */
    error?: unknown;
    /** Adds a retry to a passed `error`; a caught render error always remounts the children. */
    onRetry?: () => void;
    /** What is drawn in place of the children. */
    fallback: (error: IBoundaryError) => React.ReactNode;
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
            return this.props.fallback({ ...readError(this.props.error), onRetry: this.props.onRetry });
        }
        if (this.state.caught) {
            return this.props.fallback({ ...readError(this.state.caught.exception), onRetry: this._onRetryCaught });
        }
        return this.props.children;
    }

    //the children were unmounted when they threw, so clearing the error mounts them anew
    private _onRetryCaught = (): void => {
        this.setState({ caught: undefined });
    };
}
