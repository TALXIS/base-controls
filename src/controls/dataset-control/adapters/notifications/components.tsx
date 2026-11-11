import { INotificationMessageBarProps, NotificationMessageBar } from "@ui/notifications";

/** The replaceable pieces of the notifications. */
export interface INotificationsComponents {
    /** The bar that lists the messages. */
    onRender: (props: INotificationMessageBarProps) => JSX.Element | null;
}

/** The defaults for {@link INotificationsComponents}. */
export const NotificationsComponents: INotificationsComponents = {
    onRender: props => <NotificationMessageBar {...props} />,
};
