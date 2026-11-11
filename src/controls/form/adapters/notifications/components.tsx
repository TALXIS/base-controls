import { INotificationMessageBarProps, NotificationMessageBar } from "@ui/notifications";

export interface IFormNotificationsComponents {
    onRender: (props: INotificationMessageBarProps) => JSX.Element;
}

export const FormNotificationsComponents: IFormNotificationsComponents = {
    onRender: (props: INotificationMessageBarProps) => <NotificationMessageBar {...props} />,
};
