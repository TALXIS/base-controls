import { Pivot as FluentPivot, PivotItem, useTheme } from "@fluentui/react";
import { ITabsComponentProps } from "../components";
import React from "react";
import type { TabLikeChild } from "../../Tabs";
import { getPivotStyles } from "./styles";

//needs to be done like this to make Pivot stop bitching about children not being PivotItem
export const Pivot = (props: ITabsComponentProps) => {
    const childrenArray: TabLikeChild[] = React.Children.toArray(props.children).filter(child => React.isValidElement(child)) as TabLikeChild[];
    const theme = useTheme();
    const styles = getPivotStyles(theme);

    return <FluentPivot
        overflowBehavior="menu"
        selectedKey={props.expandedTab}
        className={styles.pivotContainer}
        styles={{
            root: styles.pivot,
            itemContainer: styles.itemContainer
        }}
        onLinkClick={(item) => props.onChangeTab?.(item?.props.itemKey!)}>
        {childrenArray.map(child => {
            if (!child.props.id) throw new Error("Tab child is missing required 'id' prop");
            return <PivotItem
                className={styles.pivotItem}
                itemKey={child.props.id}
                headerText={child.props.label || child.props.id}
                children={child}
            />
        })}

    </FluentPivot>
}