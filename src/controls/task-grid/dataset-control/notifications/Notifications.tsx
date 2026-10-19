import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { INotificationMessage } from "@ui/notifications";
import { INotificationsProps, Notifications as DatasetControlNotifications } from "@controls/dataset-control/components/adapters/notifications";
import type { ITaskDataProviderEvents } from "../../provider";
import { useTaskDatasetControl } from "../context";

/** Props for `TaskDatasetControl.Notifications`. */
export interface ITaskNotificationsProps extends INotificationsProps { }

/** `DatasetControl.Notifications`, also saying when new tasks are shown regardless of the filter. */
export const Notifications = (props: ITaskNotificationsProps) => {
    const taskDatasetControl = useTaskDatasetControl();
    const provider = taskDatasetControl.getProvider();
    const { rerender } = useRerender();

    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, ['onTasksCreated', 'onTasksDeleted'], rerender);
    useEventEmitter<IDataProviderEventListeners>(provider, 'onNewDataLoaded', rerender);

    const messages: INotificationMessage[] = [...props.messages ?? []];
    if (provider.getRecordTree().view.getForcedIds().length > 0) {
        messages.push({ text: taskDatasetControl.getLabels().getLocalizedString('newTasksShown'), level: 'INFO' });
    }
    return <DatasetControlNotifications {...props} messages={messages} />;
};
