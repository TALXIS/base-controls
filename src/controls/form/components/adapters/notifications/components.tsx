import { INotificationMessageBarProps, NotificationMessageBar } from "@ui/notifications";

export interface IFormNotificationsComponents {
    onRenderNotifications: (props: INotificationMessageBarProps) => JSX.Element;
}

export const FormNotificationsComponents: IFormNotificationsComponents = {
    onRenderNotifications: (props: INotificationMessageBarProps) => <NotificationMessageBar {...props} />,
};
