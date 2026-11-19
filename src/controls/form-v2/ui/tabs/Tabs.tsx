import * as React from "react";
import { FormV2UiTabsComponents, IFormV2UiTabsComponents, IFormV2UiTabsItem } from "./components";
import { getFormV2UiTabsStyles } from "./styles";

export interface IFormV2UiTabsProps {
    /** The headers in the strip. */
    tabs: IFormV2UiTabsItem[];
    /** Fires when the user picks another tab. */
    onChange: (name: string) => void;
    /** Replacements for its slots. */
    components?: Partial<IFormV2UiTabsComponents>;
}

/** The strip of tab headers. */
export const FormV2UiTabs = (props: IFormV2UiTabsProps) => {
    const components = { ...FormV2UiTabsComponents, ...props.components };
    const styles = React.useMemo(() => getFormV2UiTabsStyles(), []);
    return components.onRender({ tabs: props.tabs, onChange: props.onChange, className: styles.strip });
};
