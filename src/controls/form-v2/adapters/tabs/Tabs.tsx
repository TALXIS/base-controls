import { useLayoutEffect, useState } from "react";
import { useEventEmitter, useRerender } from "@core";
import type { IFormTabsEvents } from "../../runtime/parts/tabs/FormTabs";
import { FormV2Ui, IFormV2UiTabsComponents } from "../../ui";
import { useFormV2 } from "../root";

/** Props for `FormV2.Tabs`. */
export interface ITabsProps {
    /** The tab open at first; the first visible tab when left out. */
    defaultTab?: string;
    /** The `FormV2.Tab`s. */
    children?: React.ReactNode;
    /** Replacements for the tabs' slots. */
    components?: Partial<IFormV2UiTabsComponents>;
}

/** The tab strip over the form's tabs. */
export const Tabs = (props: ITabsProps) => {
    const form = useFormV2();
    const { rerender } = useRerender();

    useState(() => props.defaultTab && form.tabs.setActive(props.defaultTab));
    const tabs = form.tabs.getAll();
    const activeTab = form.tabs.getActive();

    useEventEmitter<IFormTabsEvents>(form.tabs.events, ['onTabAdded', 'onTabRemoved', 'onActiveTabChanged'], rerender);
    //the tabs provide themselves while they render, after the strip
    useLayoutEffect(rerender, []);
    useLayoutEffect(() => {
        const stops = tabs.flatMap(tab => [tab.events.addEventListener('onLabelChanged', rerender), tab.events.addEventListener('onVisibleChanged', rerender)]);
        return () => stops.forEach(stop => stop());
    });

    return <>
        <FormV2Ui.Tabs
            tabs={tabs.filter(tab => tab.isVisible()).map(tab => ({ name: tab.getName(), label: tab.getLabel(), active: tab === activeTab }))}
            onChange={name => form.tabs.setActive(name)}
            components={props.components} />
        {props.children}
    </>;
};

