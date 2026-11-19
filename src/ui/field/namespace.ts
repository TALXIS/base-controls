import { FieldList } from './list';
import { FieldValue } from './value';
import { FieldOptionSet } from './option-set';
import { FieldDateRange } from './date-range';
import { FieldProgress } from './progress';

/** A record's fields as read-only values, by the kind of value they show. */
export interface IFieldParts {
    /** Fields one under another. */
    List: typeof FieldList;
    /** A value with its icon and label. */
    Value: typeof FieldValue;
    /** One option as a tag in its colour. */
    OptionSet: typeof FieldOptionSet;
    /** When something runs, with how long it runs after it. */
    DateRange: typeof FieldDateRange;
    /** A bar filled to the progress, with the progress after it. */
    Progress: typeof FieldProgress;
}

export const Field: IFieldParts = {
    List: FieldList,
    Value: FieldValue,
    OptionSet: FieldOptionSet,
    DateRange: FieldDateRange,
    Progress: FieldProgress,
};
