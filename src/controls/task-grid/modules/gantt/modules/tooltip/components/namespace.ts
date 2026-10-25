import { TaskTooltipRoot } from "./adapters/task-tooltip";
import { TaskTooltipRenderer } from "./adapters/renderer";
import { TaskTooltipCallout } from "./adapters/callout";
import { TaskTooltipHeader } from "./adapters/header";
import { TaskTooltipFieldRows } from "./adapters/field-rows";
import { TaskTooltipFieldRow } from "./adapters/field-row";
import { TaskTooltipStartDateRow } from "./adapters/start-date-row";
import { TaskTooltipEndDateRow } from "./adapters/end-date-row";
import { TaskTooltipDurationRow } from "./adapters/duration-row";
import { TaskTooltipDateRangeRow } from "./adapters/date-range-row";
import { TaskTooltipProgressRow } from "./adapters/progress-row";

/** The parts a task tooltip is composed of, all inside `TaskTooltip`. */
export interface ITaskTooltipParts {
    /** The default tooltip, built from the parts below. */
    Renderer: typeof TaskTooltipRenderer;
    /** The callout next to the pointer. */
    Callout: typeof TaskTooltipCallout;
    /** The task's name, after the colour of its status. */
    Header: typeof TaskTooltipHeader;
    /** Holds the field rows. */
    FieldRows: typeof TaskTooltipFieldRows;
    /** Any column of the task. */
    FieldRow: typeof TaskTooltipFieldRow;
    /** The start from the timeline, which runs ahead of the record while the bar is dragged. */
    StartDateRow: typeof TaskTooltipStartDateRow;
    /** The end from the timeline, which runs ahead of the record while the bar is dragged. */
    EndDateRow: typeof TaskTooltipEndDateRow;
    /** The duration from the timeline's start and end. */
    DurationRow: typeof TaskTooltipDurationRow;
    /** The start, end and duration from the timeline, on one line. */
    DateRangeRow: typeof TaskTooltipDateRangeRow;
    /** The mapped `percentComplete` as a bar. */
    ProgressRow: typeof TaskTooltipProgressRow;
}

/** Finds the hovered or dragged bar and draws its children for that task. */
export const TaskTooltip: typeof TaskTooltipRoot & ITaskTooltipParts = Object.assign(TaskTooltipRoot, {
    Renderer: TaskTooltipRenderer,
    Callout: TaskTooltipCallout,
    Header: TaskTooltipHeader,
    FieldRows: TaskTooltipFieldRows,
    FieldRow: TaskTooltipFieldRow,
    StartDateRow: TaskTooltipStartDateRow,
    EndDateRow: TaskTooltipEndDateRow,
    DurationRow: TaskTooltipDurationRow,
    DateRangeRow: TaskTooltipDateRangeRow,
    ProgressRow: TaskTooltipProgressRow,
});
