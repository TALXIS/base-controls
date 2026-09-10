import type { IColumn } from "@talxis/client-libraries";

/** A column as the grid sees it: what the dataset says about it, plus what the grid works out. */
export interface IGridColumn extends IColumn {
    /** Whether a value is demanded before the record may be saved. */
    isRequired: boolean;
    /** Whether this column's cells take input, before a record's own say. */
    isEditable: boolean;
}
