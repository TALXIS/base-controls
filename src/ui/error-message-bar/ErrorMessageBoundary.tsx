import { ErrorBoundary, IErrorBoundaryProps } from "@core";
import { ErrorMessageBar, IErrorMessageBarProps } from "./ErrorMessageBar";

export interface IErrorMessageBoundaryProps extends Omit<IErrorBoundaryProps, 'fallback'>, Pick<IErrorMessageBarProps, 'onOpenDetails' | 'components'> { }

/** An `ErrorBoundary` that shows its error in an `ErrorMessageBar`. */
export const ErrorMessageBoundary = (props: IErrorMessageBoundaryProps) => {
    const { onOpenDetails, components, ...boundary } = props;
    return <ErrorBoundary {...boundary} fallback={error => <ErrorMessageBar {...error} onOpenDetails={onOpenDetails} components={components} />} />;
};
