import { ReactNode } from "react";
import { IRecordCardFieldRowsComponents, RecordCardFieldRows } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IRecordCardFieldRowsComponents>;
}

/** The rows of the task's fields, one under another. */
export const TaskTooltipFieldRows = (props: ITaskTooltipFieldRowsProps) => {
    //called only to throw outside the tooltip
    useTaskTooltip();
    return <RecordCardFieldRows components={props.components}>{props.children}</RecordCardFieldRows>;
};
