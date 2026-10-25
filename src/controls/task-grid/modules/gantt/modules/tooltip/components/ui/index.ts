import { TaskTooltipUiCallout } from './callout';
import { TaskTooltipUiHeader } from './header';
import { TaskTooltipUiFieldRows } from './field-rows';
import { TaskTooltipUiFieldRow } from './field-row';
import { TaskTooltipUiDateRange } from './date-range';
import { TaskTooltipUiProgress } from './progress';

export * from './callout';
export * from './header';
export * from './field-rows';
export * from './field-row';
export * from './date-range';
export * from './progress';

/** What draws a task tooltip, and nothing that knows which task. */
export interface ITaskTooltipUi {
    Callout: typeof TaskTooltipUiCallout;
    Header: typeof TaskTooltipUiHeader;
    FieldRows: typeof TaskTooltipUiFieldRows;
    FieldRow: typeof TaskTooltipUiFieldRow;
    DateRange: typeof TaskTooltipUiDateRange;
    Progress: typeof TaskTooltipUiProgress;
}

export const TaskTooltipUi: ITaskTooltipUi = {
    Callout: TaskTooltipUiCallout,
    Header: TaskTooltipUiHeader,
    FieldRows: TaskTooltipUiFieldRows,
    FieldRow: TaskTooltipUiFieldRow,
    DateRange: TaskTooltipUiDateRange,
    Progress: TaskTooltipUiProgress,
};
