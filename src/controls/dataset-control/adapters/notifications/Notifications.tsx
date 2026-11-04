import { useEffect, useMemo } from "react";
import { useEventEmitter, useRerender } from "@core";
import { INotificationMessageBarProps } from "@ui/notifications";
import { useDataProvider } from "@data";
import { useRegisterDatasetControlPart } from "../root";
import { INotificationsComponents, NotificationsComponents } from "./components";
import { DatasetControlNotifications, IDatasetControlNotificationsEvents } from "../../runtime/parts/notifications/DatasetControlNotifications";

/** Props for `DatasetControl.Notifications`. */
export interface INotificationsProps extends Omit<INotificationMessageBarProps, 'components'> {
    /** Replacements for the notifications' pieces. */
    components?: Partial<INotificationsComponents>;
}

/** The provider's load error, next to the messages passed in, in Form's notification bar. */
export const Notifications = (props: INotificationsProps) => {
    const provider = useDataProvider();
    const notifications = useRegisterDatasetControlPart('notifications', () => new DatasetControlNotifications({ provider }));
    const { rerender } = useRerender();
    const { messages = [], components: componentsProp, ...notificationsProps } = props;
    const components = { ...NotificationsComponents, ...componentsProp };

    useEventEmitter<IDatasetControlNotificationsEvents>(notifications.events, 'onNotificationsChanged', rerender);
    useEffect(() => () => notifications.destroy(), []);

    const allMessages = [...messages, ...notifications.getMessages()];

    return components.onRenderNotifications({
        ...notificationsProps,
        messages: allMessages,
    });
};
