import { Check, ICheckProps } from "@fluentui/react";

/** The replaceable pieces of the completion checkbox. */
export interface ICompletionCheckboxUiComponents {
    /** The button; its `children` are the check. */
    onRenderButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => JSX.Element | null;
    onRenderCheck: (props: ICheckProps) => JSX.Element | null;
}

/** The defaults for {@link ICompletionCheckboxUiComponents}. */
export const CompletionCheckboxUiComponents: ICompletionCheckboxUiComponents = {
    onRenderButton: props => <button {...props} />,
    onRenderCheck: props => <Check {...props} />,
};
