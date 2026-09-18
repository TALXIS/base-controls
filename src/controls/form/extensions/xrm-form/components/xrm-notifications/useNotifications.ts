import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { useFormXmlContext } from "../context";

export const useNotifications = () => {
    const form = useFormXmlContext();
    const rerender = useRerender();
    useEventEmitter(form.events, "onNotificationsChanged", rerender);

    return form.getNotifications();
}