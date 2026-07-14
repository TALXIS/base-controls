import { Pivot as FluentPivot } from "@fluentui/react";
import { ITabsComponentProps } from "../components";

export const Pivot = (props: ITabsComponentProps) => <FluentPivot
    children={props.children}
    overflowBehavior="menu"
    selectedKey={props.form.getExpandedTab()?.id}
    onLinkClick={(item) => props.onChangeTab?.(item?.props.itemKey!)}
/>