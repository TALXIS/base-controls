import { createContext, useContext } from "react";
import type { Task } from "dhtmlx-gantt";
import type { IPoint } from "@fluentui/react";
import type { IRecord } from "@talxis/client-libraries";
import type { IGantt } from "../../../../interfaces";
import type { IGanttSpan } from "../../../../schedule";

/** The task a tooltip is drawn for. */
export interface ITaskTooltipContext {
    gantt: IGantt;
    record: IRecord;
    /** The chart's task, whose dates run ahead of the record's while its bar is dragged. */
    task: Task;
    /** Where the pointer is. */
    target: IPoint;
    /** Where the task's bar runs, ahead of the record while dragged. */
    span?: IGanttSpan;
    /** How long the task takes in minutes, calculated from its bar while dragged. */
    duration?: number;
    /** The colour the task's bar is drawn in. */
    color?: string;
}

export const TaskTooltipContext = createContext<ITaskTooltipContext | undefined>(undefined);
TaskTooltipContext.displayName = 'TaskTooltip';

/** The task this tooltip is drawn for. */
export const useTaskTooltip = (): ITaskTooltipContext => {
    const context = useContext(TaskTooltipContext);
    if (!context) {
        throw new Error('This has to be drawn in the task tooltip, which createTaskTooltipModule draws for the hovered bar.');
    }
    return context;
};
