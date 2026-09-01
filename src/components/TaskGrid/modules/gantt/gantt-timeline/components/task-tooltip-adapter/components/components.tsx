import { ICalloutProps } from '@fluentui/react';
import { TaskTooltipCallout } from '../../task-tooltip-callout';

export interface ITaskTooltipAdapterComponents {
    onRenderCallout: (props: ICalloutProps) => JSX.Element;
}

export const TaskTooltipAdapterComponents: ITaskTooltipAdapterComponents = {
    onRenderCallout: (props: ICalloutProps) => <TaskTooltipCallout {...props} />
};
