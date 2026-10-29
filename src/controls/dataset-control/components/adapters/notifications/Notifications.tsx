import { useEffect, useMemo } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { INotificationMessageBarProps } from "@ui/notifications";
import { useDataProvider, useLabels } from "@utils";
import { useDatasetControlPart } from "../root";
import { NOTIFICATIONS_LABELS } from "./labels";
import { INotificationsComponents, NotificationsComponents } from "./components";
import { DatasetControlNotifications, IDatasetControlNotificationsEvents } from "./DatasetControlNotifications";

/** Props for `DatasetControl.Notifications`. */
export interface INotificationsProps extends Omit<INotificationMessageBarProps, 'groupedNotificationsSummary' | 'components'> {
    /** Replacements for the notifications' pieces. */
    components?: Partial<INotificationsComponents>;
}

/** The provider's load error, next to the messages passed in, in Form's notification bar. */
export const Notifications = (props: INotificationsProps) => {
    const provider = useDataProvider();
    const notifications = useDatasetControlPart('notifications', () => new DatasetControlNotifications({ provider }));
    const { rerender } = useRerender();
    const { messages = [], components: componentsProp, ...notificationsProps } = props;
    const labels = useLabels(NOTIFICATIONS_LABELS);
    const components = { ...NotificationsComponents, ...componentsProp };

    useEventEmitter<IDatasetControlNotificationsEvents>(notifications.events, 'onNotificationsChanged', rerender);
    useEffect(() => () => notifications.destroy(), []);

    const allMessages = [...messages, ...notifications.getMessages()];

    return components.onRenderNotifications({
        ...notificationsProps,
        groupedNotificationsSummary: labels.get('notifications.groupedNotificationsSummary', { count: allMessages.length }),
        messages: allMessages,
    });
};
