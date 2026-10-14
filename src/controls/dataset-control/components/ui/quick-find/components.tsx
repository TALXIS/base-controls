import { ITextFieldProps, TextField } from "@legacy";
import { IQuickFindCalloutComponents } from "./callout";
import { IQuickFindCompactButtonComponents } from "./compact-button";

/** The strings of the quick find's callout. */
export interface IQuickFindUiLabels {
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
export interface IQuickFindUiComponents {
    /** The box around the field, which the callout points at. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The search field. */
    onRenderTextField: (props: ITextFieldProps) => JSX.Element | null;
    /** The search button drawn in place of the field while the quick find is compact. */
    compact?: Partial<IQuickFindCompactButtonComponents>;
    /** What explains how the search matches, under the field. */
    callout?: Partial<IQuickFindCalloutComponents>;
}

/** The defaults for {@link IQuickFindUiComponents}. */
export const QuickFindUiComponents: IQuickFindUiComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderTextField: props => <TextField {...props} />,
};
