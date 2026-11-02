import { ICalloutProps } from "@fluentui/react";
import { Callout } from "@ui";

/** The replaceable pieces of the tooltip's callout. */
export interface ITooltipUiCalloutComponents {
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    /** Holds what the tooltip shows, inside the callout. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITooltipUiCalloutComponents}. */
export const TooltipUiCalloutComponents: ITooltipUiCalloutComponents = {
    onRenderCallout: props => <Callout {...props} />,
    onRenderContainer: props => <div {...props} />,
};
