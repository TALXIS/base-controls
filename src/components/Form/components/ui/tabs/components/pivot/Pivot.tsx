import { Pivot as FluentPivot, PivotItem, useTheme } from "@fluentui/react";
import { ITabsComponentProps } from "../components";
import React, { useMemo } from "react";
import type { TabLikeChild } from "@components/Form/components/ui/tabs/Tabs";
import { getPivotItemStyles } from "./styles";


export const Pivot = (props: ITabsComponentProps) => {
    const childrenArray: TabLikeChild[] = React.Children.toArray(props.children).filter(child => React.isValidElement(child)) as TabLikeChild[];
    const styles = useMemo(() => getPivotItemStyles(), []);

    return <FluentPivot
        {...props}
        >
        {childrenArray.map(child => {
            if (!child.props.id) throw new Error("Tab child is missing required 'id' prop");
            return <PivotItem
                key={child.props.id}
                className={styles.pivotItem}
                itemKey={child.props.id}
                headerText={child.props.label || child.props.id}
                headerButtonProps={{ "data-id": `tab-header-${child.props.id}` }}
                children={child}
            />;
        })}

    </FluentPivot>;
};
