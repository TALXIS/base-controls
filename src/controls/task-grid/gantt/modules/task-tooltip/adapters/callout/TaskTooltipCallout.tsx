import { ReactNode } from "react";
import { ITooltipUiCalloutComponents, TooltipUiCallout } from "../../../../ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipCalloutProps {
    children?: ReactNode;
    components?: Partial<ITooltipUiCalloutComponents>;
}

/** The callout the tooltip is drawn in, next to the pointer. */
export const TaskTooltipCallout = (props: ITaskTooltipCalloutProps) => {
    const { target } = useTaskTooltip();
    return <TooltipUiCallout target={target} components={props.components}>{props.children}</TooltipUiCallout>;
};
