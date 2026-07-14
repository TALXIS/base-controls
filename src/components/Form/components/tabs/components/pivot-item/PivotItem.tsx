import { PivotItem as FluentPivotItem } from "@fluentui/react";
import { ITabComponentProps } from "../components";

export const PivotItem = (props: ITabComponentProps) => <FluentPivotItem
    itemKey={props.tab.id}
    headerText={props.tab.label ?? props.tab.name ?? props.tab.id}
    children={props.children}
/>