import { Pivot as FluentPivot, PivotItem } from "@fluentui/react";
import { ITabsComponentProps } from "../components";
import React from "react";

//needs to be done like this to make Pivot stop bitching about children not being PivotItem
export const Pivot = (props: ITabsComponentProps) => {
    const childrenArray = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    
    return <FluentPivot
        overflowBehavior="menu"
        selectedKey={props.expandedTab}
        onLinkClick={(item) => props.onChangeTab?.(item?.props.itemKey!)}>
        {childrenArray.map(child => {
            return <PivotItem
                itemKey={child.props.id}
                headerText={child.props.label ?? child.props.name ?? child.props.id}
                children={child}
            />
        })}
            
    </FluentPivot>
}