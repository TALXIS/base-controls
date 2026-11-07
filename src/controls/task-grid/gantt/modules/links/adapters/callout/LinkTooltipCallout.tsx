import { ReactNode } from "react";
import { ITooltipUiCalloutComponents, TooltipUiCallout } from "../../../../ui/tooltip";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipCalloutProps {
    children?: ReactNode;
    components?: Partial<ITooltipUiCalloutComponents>;
}

/** The callout the tooltip is drawn in, next to the pointer. */
export const LinkTooltipCallout = (props: ILinkTooltipCalloutProps) => {
    const { target } = useLinkTooltip();
    return <TooltipUiCallout target={target} components={props.components}>{props.children}</TooltipUiCallout>;
};
