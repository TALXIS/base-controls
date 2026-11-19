import { ReactNode } from "react";
import { IFieldListComponents, FieldList } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** The rows of the task's fields, one under another. */
export const TaskTooltipFieldRows = (props: ITaskTooltipFieldRowsProps) => {
    //called only to throw outside the tooltip
    useTaskTooltip();
    return <FieldList components={props.components}>{props.children}</FieldList>;
};
