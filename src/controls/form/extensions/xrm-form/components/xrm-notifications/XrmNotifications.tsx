import { Form } from "@controls/form/components/Form";
import { INotification } from "@controls/form/extensions/xrm-form/internal/form-xml-form";
import { useNotifications } from "./useNotifications";
import { useXrmFormComponents } from "../xrm-form/context";

const getNotifications = (notifications: INotification[]) => {
    return notifications.map(notification => ({
        text: notification.message,
        level: notification.level
    }));
}

export const XrmNotifications = () => {
    const messages = getNotifications(useNotifications());
    const components = useXrmFormComponents();

    return <Form.Notifications messages={messages} components={components.notifications} />
}