import { useRerender, useEventEmitter } from "@core";
import { useFormXmlModel } from "../context";

export const useXrmTabs = () => {
    const form = useFormXmlModel();
    const tabs = form.tabs;
    const { rerender } = useRerender();

    useEventEmitter(tabs.events, ['onExpandedTabChanged', 'onTabVisibilityChanged'], rerender);

    return tabs;
}