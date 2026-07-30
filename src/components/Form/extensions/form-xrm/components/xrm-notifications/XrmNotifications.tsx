import { Form } from "@components/Form/components/Form";
import { INotification } from "@components/Form/extensions/form-xrm/internal/form-xml-form";
import { useNotifications } from "./useNotifications";

const getNotifications = (notifications: INotification[]) => {
    return notifications.map(notification => ({
        text: notification.message,
        level: notification.level
    }));
}

export const XrmNotifications = () => {
    const notifications = getNotifications(useNotifications());

    return <Form.Notifications messages={notifications} />
}