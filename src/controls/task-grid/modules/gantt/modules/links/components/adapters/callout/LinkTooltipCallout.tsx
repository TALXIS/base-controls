import { ReactNode } from "react";
import { ITaskTooltipUiCalloutComponents, TaskTooltipUiCallout } from "../../../../tooltip/components/ui";
import { useLinkTooltip } from "../link-tooltip";

export interface ILinkTooltipCalloutProps {
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiCalloutComponents>;
}

/** The callout the tooltip is drawn in, next to the pointer. */
export const LinkTooltipCallout = (props: ILinkTooltipCalloutProps) => {
    const { target } = useLinkTooltip();
    return <TaskTooltipUiCallout target={target} components={props.components}>{props.children}</TaskTooltipUiCallout>;
};
