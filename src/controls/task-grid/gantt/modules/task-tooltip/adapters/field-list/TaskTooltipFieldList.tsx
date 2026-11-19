import { ReactNode } from "react";
import { IFieldListComponents, Field } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipFieldListProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** The task's fields, one under another. */
export const TaskTooltipFieldList = (props: ITaskTooltipFieldListProps) => {
    //called only to throw outside the tooltip
    useTaskTooltip();
    return <Field.List components={props.components}>{props.children}</Field.List>;
};
