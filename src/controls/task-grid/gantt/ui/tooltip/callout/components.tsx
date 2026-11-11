import { ICalloutProps } from "@fluentui/react";
import { Callout, RecordCard } from "@ui";

/** The replaceable pieces of the tooltip's callout. */
export interface ITooltipUiCalloutComponents {
    onRender: (props: ICalloutProps) => JSX.Element | null;
    /** Holds what the tooltip shows, inside the callout. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITooltipUiCalloutComponents}. */
export const TooltipUiCalloutComponents: ITooltipUiCalloutComponents = {
    onRender: props => <Callout {...props} />,
    onRenderContainer: props => <RecordCard className={props.className}>{props.children}</RecordCard>,
};
