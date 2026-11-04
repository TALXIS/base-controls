import { useRerender, useEventEmitter } from "@core";
import { useFormXmlContext } from "../context";

export const useTabs = () => {
    const form = useFormXmlContext();
    const tabs = form.tabs;
    const { rerender } = useRerender();

    useEventEmitter(tabs.events, ['onExpandedTabChanged', 'onTabVisibilityChanged'], rerender);

    return tabs;
}