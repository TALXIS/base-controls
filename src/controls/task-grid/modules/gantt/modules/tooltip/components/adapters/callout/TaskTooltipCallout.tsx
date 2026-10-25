import { ReactNode } from "react";
import { ITaskTooltipUiCalloutComponents, TaskTooltipUiCallout } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipCalloutProps {
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiCalloutComponents>;
}

/** The callout the tooltip is drawn in, next to the pointer. */
export const TaskTooltipCallout = (props: ITaskTooltipCalloutProps) => {
    const { target } = useTaskTooltip();
    return <TaskTooltipUiCallout target={target} components={props.components}>{props.children}</TaskTooltipUiCallout>;
};
