import { FieldListRoot } from './list';
import { FieldListRow } from './row';
import { FieldListDateRange } from './date-range';
import { FieldListProgress } from './progress';

/** The parts of a field list, attached to the list itself. */
export interface IFieldListParts {
    /** One value with its icon and label. */
    Row: typeof FieldListRow;
    /** When something runs, with how long it runs after it. */
    DateRange: typeof FieldListDateRange;
    /** A bar filled to the progress, with the progress after it. */
    Progress: typeof FieldListProgress;
}

/** Labelled read-only values, such as in a tooltip or a popup. */
export const FieldList: typeof FieldListRoot & IFieldListParts = Object.assign(FieldListRoot, {
    Row: FieldListRow,
    DateRange: FieldListDateRange,
    Progress: FieldListProgress,
});
