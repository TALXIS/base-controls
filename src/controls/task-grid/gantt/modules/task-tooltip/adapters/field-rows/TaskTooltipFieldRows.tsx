import { ReactNode } from "react";
import { IRecordCardFieldRowsComponents, RecordCardFieldRows } from "@ui";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IRecordCardFieldRowsComponents>;
}

/** The rows of the task's fields, one under another. */
export const TaskTooltipFieldRows = (props: ITaskTooltipFieldRowsProps) => {
    //called only to throw outside a tooltip root
    useTaskTooltip();
    return <RecordCardFieldRows components={props.components}>{props.children}</RecordCardFieldRows>;
};
