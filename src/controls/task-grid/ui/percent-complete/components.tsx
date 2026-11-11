import { IProgressIndicatorProps, ProgressIndicator } from "@fluentui/react";

/** The replaceable pieces of the percent complete bar. */
export interface ITaskGridUiPercentCompleteComponents {
    onRender: (props: IProgressIndicatorProps) => JSX.Element | null;
}

/** The defaults for {@link ITaskGridUiPercentCompleteComponents}. */
export const TaskGridUiPercentCompleteComponents: ITaskGridUiPercentCompleteComponents = {
    onRender: props => <ProgressIndicator {...props} />,
};
