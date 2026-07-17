import { Pivot as FluentPivot, PivotItem } from "@fluentui/react";
import { ITabsComponentProps } from "../components";
import React from "react";
import type { TabLikeChild } from "../../Tabs";

//needs to be done like this to make Pivot stop bitching about children not being PivotItem
export const Pivot = (props: ITabsComponentProps) => {
    const childrenArray: TabLikeChild[] = React.Children.toArray(props.children).filter(child => React.isValidElement(child)) as TabLikeChild[];
    
    return <FluentPivot
        overflowBehavior="menu"
        selectedKey={props.expandedTab}
        onLinkClick={(item) => props.onChangeTab?.(item?.props.itemKey!)}>
        {childrenArray.map(child => {
            if(!child.props.id) throw new Error("Tab child is missing required 'id' prop");
            return <PivotItem
                itemKey={child.props.id}
                headerText={child.props.label || child.props.id}
                children={child}
            />
        })}
            
    </FluentPivot>
}