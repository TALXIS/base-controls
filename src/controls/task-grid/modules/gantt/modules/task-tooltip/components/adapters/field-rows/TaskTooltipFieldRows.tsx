import { ReactNode } from "react";
import { ITooltipUiFieldRowsComponents, TooltipUiFieldRows } from "../../../../../components/ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<ITooltipUiFieldRowsComponents>;
}

/** The rows of the task's fields, one under another. */
export const TaskTooltipFieldRows = (props: ITaskTooltipFieldRowsProps) => {
    //called only to throw outside a tooltip root
    useTaskTooltip();
    return <TooltipUiFieldRows components={props.components}>{props.children}</TooltipUiFieldRows>;
};
