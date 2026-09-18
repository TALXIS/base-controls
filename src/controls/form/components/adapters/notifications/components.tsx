import { INotificationsProps, Notifications as NotificationsBase } from "@ui/notifications";

export interface IFormNotificationsComponents {
    onRenderNotifications: (props: INotificationsProps) => JSX.Element;
}

export const FormNotificationsComponents: IFormNotificationsComponents = {
    onRenderNotifications: (props: INotificationsProps) => <NotificationsBase {...props} />,
};
