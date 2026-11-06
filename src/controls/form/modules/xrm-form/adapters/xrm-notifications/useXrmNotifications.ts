import { useRerender, useEventEmitter } from "@core";
import { useFormXmlModel } from "../context";

export const useXrmNotifications = () => {
    const form = useFormXmlModel();
    const { rerender } = useRerender();
    useEventEmitter(form.events, "onNotificationsChanged", rerender);

    return form.getNotifications();
}