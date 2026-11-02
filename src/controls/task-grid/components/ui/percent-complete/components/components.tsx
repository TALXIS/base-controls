import { IProgressIndicatorProps, ProgressIndicator } from "@fluentui/react";

/** The replaceable pieces of the percent complete bar. */
export interface ITaskGridUiPercentCompleteComponents {
    onRenderProgress: (props: IProgressIndicatorProps) => JSX.Element | null;
}

/** The defaults for {@link ITaskGridUiPercentCompleteComponents}. */
export const TaskGridUiPercentCompleteComponents: ITaskGridUiPercentCompleteComponents = {
    onRenderProgress: props => <ProgressIndicator {...props} />,
};
