import { ReactNode } from "react";
import { ITaskTooltipUiFieldRowsComponents, TaskTooltipUiFieldRows } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiFieldRowsComponents>;
}

/** The rows of the task's fields, one under another. */
export const TaskTooltipFieldRows = (props: ITaskTooltipFieldRowsProps) => {
    //called only to throw outside a tooltip root
    useTaskTooltip();
    return <TaskTooltipUiFieldRows components={props.components}>{props.children}</TaskTooltipUiFieldRows>;
};
