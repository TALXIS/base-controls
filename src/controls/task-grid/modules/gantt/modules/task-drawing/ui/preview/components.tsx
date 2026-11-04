import { ICalloutProps } from "@fluentui/react";
import { Callout } from "@ui";

/** The replaceable pieces of the preview of a task being drawn. */
export interface ITaskDrawingUiPreviewComponents {
    /** Highlights the row the task goes above and holds the span. */
    onRenderRow: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The span drawn so far. */
    onRenderSpan: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    /** What the callout says. */
    onRenderText: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskDrawingUiPreviewComponents}. */
export const TaskDrawingUiPreviewComponents: ITaskDrawingUiPreviewComponents = {
    onRenderRow: props => <div {...props} />,
    onRenderSpan: props => <div {...props} />,
    onRenderCallout: props => <Callout {...props} />,
    onRenderText: props => <div {...props} />,
};
