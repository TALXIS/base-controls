import { IRuntimeNotificationsEvents, RuntimeNotifications, useEventEmitter, useRerender } from "@core";
import { INotificationMessageBarComponents, NotificationMessageBar } from "@ui/notifications";
import { useProvidePart } from "../../context";

export interface IRuntimeNotificationBarProps {
    components?: Partial<INotificationMessageBarComponents>;
}

/** Provides the runtime's `notifications` part and draws its messages. */
export const RuntimeNotificationBar = (props: IRuntimeNotificationBarProps) => {
    const notifications = useProvidePart('notifications', () => new RuntimeNotifications());
    const { rerender } = useRerender();
    useEventEmitter<IRuntimeNotificationsEvents>(notifications.events, 'onNotificationsChanged', rerender);
    return <NotificationMessageBar messages={notifications.getMessages()} components={props.components} />;
};
