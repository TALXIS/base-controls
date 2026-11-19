import { useEventEmitter, useRerender } from "@core";
import type { IFormTabsEvents } from "../../runtime/parts/tabs/FormTabs";
import { FormTab, IFormTabEvents } from "../../runtime/parts/tab/FormTab";
import { FormV2Ui, IFormV2UiLayoutBreakpoints, IFormV2UiTabComponents } from "../../ui";
import { useFormV2, useProvideFormTab } from "../root";
import { FormTabContext } from "./context";

/** Props for `FormV2.Tab`. */
export interface ITabProps {
    /** Unique among the form's tabs; `form.tabs.get(name)` finds it. */
    name: string;
    /** Initial value; defaults to `name`. */
    label?: string;
    /** Initial value; defaults to `true`. */
    visible?: boolean;
    /** Columns per row by width; `lg` alone derives the rest. */
    layout?: Partial<IFormV2UiLayoutBreakpoints>;
    children?: React.ReactNode;
    /** Replacements for the tab's slots. */
    components?: Partial<IFormV2UiTabComponents>;
}

/** One tab; drawn while closed too, hidden, so all of its parts can be found. */
export const Tab = (props: ITabProps) => {
    const form = useFormV2();
    const tab = useProvideFormTab(props.name, () => new FormTab({ name: props.name, form, label: props.label, visible: props.visible }));
    const { rerender } = useRerender();

    useEventEmitter<IFormTabEvents>(tab.events, 'onVisibleChanged', rerender);
    useEventEmitter<IFormTabsEvents>(form.tabs.events, 'onActiveTabChanged', rerender);

    return <FormTabContext.Provider value={tab}>
        <FormV2Ui.Tab name={props.name} layout={props.layout} hidden={!tab.isVisible() || form.tabs.getActive() !== tab} components={props.components}>
            {props.children}
        </FormV2Ui.Tab>
    </FormTabContext.Provider>;
};
