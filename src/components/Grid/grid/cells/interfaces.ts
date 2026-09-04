import type { IAddControlNotificationOptions, IColumn, ICustomColumnComponent, ICustomColumnFormatting } from "@talxis/client-libraries";

/**
 * Everything a cell needs to render itself, worked out in one pass.
 *
 * One bag rather than a call per question, because AG Grid asks for this per cell per value read — and a
 * module may add to it through the cell-values hook.
 */
export interface ICellValues {
    /** What the column's control is reporting about this value: validation, warnings, hints. */
    notifications: IAddControlNotificationOptions[];
    /** The colours and classes this cell takes, its row's theme included. */
    customFormatting: Required<ICustomColumnFormatting>;
    /** A component supplied in place of a control, where a column names one. */
    customComponent: ICustomColumnComponent;
    /** Whether the value is still being fetched. */
    loading: boolean;
    /** The value itself, as the record holds it. */
    value: any;
    /** What this column totals to, where a module contributed one. */
    aggregatedValue: any;
    /** Whether reading the value failed. */
    error: boolean;
    /** Why reading the value failed. */
    errorMessage: string;
    /** Which way the content is aligned, from the column. */
    columnAlignment: Required<IColumn['alignment']>;
    /** Whether it may be edited at all. */
    editable: boolean;
    /** Whether it refuses input, editable or not. */
    disabled: boolean;
    /** Whether the record it belongs to is being saved. */
    saving: boolean;
}
