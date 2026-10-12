import { useEffect, useMemo } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { INotificationMessageBarProps } from "@ui/notifications";
import { useDataProvider } from "@utils";
import { useRequiredDatasetControlRuntime } from "../root";
import { INotificationsLabels, NOTIFICATIONS_LABELS } from "./labels";
import { INotificationsComponents, NotificationsComponents } from "./components";
import { DatasetControlNotifications, IDatasetControlNotificationsEvents } from "./DatasetControlNotifications";

export interface INotificationsProps extends Omit<INotificationMessageBarProps, 'labels' | 'components'> {
    labels?: Partial<INotificationsLabels>;
    components?: Partial<INotificationsComponents>;
}

/** The provider's load error, next to the messages passed in, in Form's notification bar. */
export const Notifications = (props: INotificationsProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProvider();
    const notifications = useMemo(() => new DatasetControlNotifications({ services: runtime.services, provider }), []);
    const { rerender } = useRerender();
    const { messages = [], labels, components: componentsProp, ...notificationsProps } = props;
    const components = { ...NotificationsComponents, ...componentsProp };

    useEventEmitter<IDatasetControlNotificationsEvents>(notifications.events, 'onNotificationsChanged', rerender);
    useEffect(() => () => notifications.destroy(), []);

    return components.onRenderNotifications({
        ...notificationsProps,
        labels: { ...NOTIFICATIONS_LABELS, ...labels },
        messages: [...messages, ...notifications.getMessages()],
    });
};
