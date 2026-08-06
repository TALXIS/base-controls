import { Form } from "@components/Form/components/Form";
import { INotification } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
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