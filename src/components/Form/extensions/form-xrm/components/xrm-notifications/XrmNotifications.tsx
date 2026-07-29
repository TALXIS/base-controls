import { Form } from "../../../../components/Form";
import { INotification } from "../../FormXmlForm";
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