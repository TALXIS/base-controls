import { ITextFieldProps, TextField } from "@legacy";
import { IDatasetControlUiQuickFindCalloutComponents } from "./callout";
import { IDatasetControlUiQuickFindCompactButtonComponents } from "./compact-button";

/** The strings of the quick find's callout. */
export interface IDatasetControlUiQuickFindLabels {
    /** Shown when the query starts with `*`. */
    leadingWildcardWarning: string;
    /** The start of the sentence above the columns. */
    columnsHintStart: string;
    /** The bold operator between the columns. */
    columnsHintOperator: string;
    /** The end of the sentence above the columns. */
    columnsHintEnd: string;
}

/** The replaceable pieces of the quick find. */
export interface IDatasetControlUiQuickFindComponents {
    /** The box around the field, which the callout points at. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The search field. */
    onRenderTextField: (props: ITextFieldProps) => JSX.Element | null;
    /** The search button drawn in place of the field while the quick find is compact. */
    compact?: Partial<IDatasetControlUiQuickFindCompactButtonComponents>;
    /** What explains how the search matches, under the field. */
    callout?: Partial<IDatasetControlUiQuickFindCalloutComponents>;
}

/** The defaults for {@link IDatasetControlUiQuickFindComponents}. */
export const DatasetControlUiQuickFindComponents: IDatasetControlUiQuickFindComponents = {
    onRender: props => <div {...props} />,
    onRenderTextField: props => <TextField {...props} />,
};
