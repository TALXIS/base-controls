import { createContext, useContext } from "react";
import type { Task } from "gantt-trial";
import type { IPoint } from "@fluentui/react";
import type { IRecord } from "@talxis/client-libraries";
import type { IGantt } from "../../../../../interfaces";

/** The task a tooltip is drawn for. */
export interface ITaskTooltipContext {
    gantt: IGantt;
    record: IRecord;
    /** The chart's task, whose dates run ahead of the record's while its bar is dragged. */
    task: Task;
    /** Where the pointer is. */
    target: IPoint;
}

export const TaskTooltipContext = createContext<ITaskTooltipContext | undefined>(undefined);
TaskTooltipContext.displayName = 'TaskTooltip';

/** The task this tooltip is drawn for. */
export const useTaskTooltip = (): ITaskTooltipContext => {
    const context = useContext(TaskTooltipContext);
    if (!context) {
        throw new Error('This has to be drawn inside TaskTooltip, which is what finds the task it is for.');
    }
    return context;
};
