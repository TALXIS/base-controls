import { Card } from "@ui";
import { TaskTooltipRenderer } from "./adapters/renderer";
import { TaskTooltipCallout } from "./adapters/callout";
import { TaskTooltipHeader } from "./adapters/header";
import { TaskTooltipFieldList } from "./adapters/field-list";
import { TaskTooltipField } from "./adapters/field";
import { TaskTooltipStartDate } from "./adapters/start-date";
import { TaskTooltipEndDate } from "./adapters/end-date";
import { TaskTooltipDuration } from "./adapters/duration";
import { TaskTooltipDateRange } from "./adapters/date-range";
import { TaskTooltipProgress } from "./adapters/progress";

/** The parts a task tooltip is composed of; the module draws them for the hovered or dragged bar. */
export interface ITaskTooltipParts {
    /** The default tooltip, built from the parts below. */
    Renderer: typeof TaskTooltipRenderer;
    /** The callout next to the pointer. */
    Callout: typeof TaskTooltipCallout;
    /** The task's name, after the colour of its status. */
    Header: typeof TaskTooltipHeader;
    /** Holds the fields below the header. */
    Body: typeof Card.Body;
    /** The band at the bottom, below a divider. */
    Footer: typeof Card.Footer;
    /** Holds the fields, one under another. */
    FieldList: typeof TaskTooltipFieldList;
    /** Any column of the task. */
    Field: typeof TaskTooltipField;
    /** The start from the timeline, which runs ahead of the record while the bar is dragged. */
    StartDate: typeof TaskTooltipStartDate;
    /** The end from the timeline, which runs ahead of the record while the bar is dragged. */
    EndDate: typeof TaskTooltipEndDate;
    /** The duration from the timeline's start and end. */
    Duration: typeof TaskTooltipDuration;
    /** The start, end and duration from the timeline, on one line. */
    DateRange: typeof TaskTooltipDateRange;
    /** The mapped `percentComplete` as a bar. */
    Progress: typeof TaskTooltipProgress;
}

export const TaskTooltip: ITaskTooltipParts = {
    Renderer: TaskTooltipRenderer,
    Callout: TaskTooltipCallout,
    Header: TaskTooltipHeader,
    Body: Card.Body,
    Footer: Card.Footer,
    FieldList: TaskTooltipFieldList,
    Field: TaskTooltipField,
    StartDate: TaskTooltipStartDate,
    EndDate: TaskTooltipEndDate,
    Duration: TaskTooltipDuration,
    DateRange: TaskTooltipDateRange,
    Progress: TaskTooltipProgress,
};
