import { ITextFieldProps, TextField } from "@legacy";
import { IQuickFindCalloutComponents, IQuickFindCalloutProps, QuickFindCallout } from "./callout";

export interface IQuickFindUiLabels {
    leadingWildcardWarning: string;
    columnsHintStart: string;
    columnsHintOperator: string;
    columnsHintEnd: string;
}

/** The replaceable pieces of the quick find. */
export interface IQuickFindUiComponents {
    onRenderTextField: (props: ITextFieldProps) => JSX.Element | null;
    /** What explains how the search matches, under the field. */
    onRenderCallout: (props: IQuickFindCalloutProps) => JSX.Element | null;
    /** Handed to `onRenderCallout` as its `components`. */
    callout?: Partial<IQuickFindCalloutComponents>;
}

/** The defaults for {@link IQuickFindUiComponents}. */
export const QuickFindUiComponents: IQuickFindUiComponents = {
    onRenderTextField: props => <TextField {...props} />,
    onRenderCallout: props => <QuickFindCallout {...props} />,
};
