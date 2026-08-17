import { PivotItem, useTheme } from "@fluentui/react";
import { ITabsComponentProps } from "../components";
import React, { useMemo } from "react";
import type { TabLikeChild } from "@components/Form/components/ui/tabs/Tabs";
import { getPivotStyles } from "./styles";
import { IPivotComponents, PivotComponents } from "./components";

interface IPivotProps extends ITabsComponentProps {
    components?: Partial<IPivotComponents>;
}

export const Pivot = (props: IPivotProps) => {
    
    const components = { ...PivotComponents, ...props.components };
    const childrenArray: TabLikeChild[] = React.Children.toArray(props.children).filter(child => React.isValidElement(child)) as TabLikeChild[];
    const theme = useTheme();
    const styles = useMemo(() => getPivotStyles(theme), [theme]);

    return components.onRenderPivot({
        overflowBehavior: 'menu',
        selectedKey: props.expandedTab,
        className: styles.pivotContainer,
        styles: {
            root: styles.pivot,
            itemContainer: styles.itemContainer
        },
        onLinkClick: (item) => props.onTabChange?.(item?.props.itemKey!),
        children: childrenArray.map(child => {
            if (!child.props.id) throw new Error("Tab child is missing required 'id' prop");
            return <PivotItem
                key={child.props.id}
                className={styles.pivotItem}
                itemKey={child.props.id}
                headerText={child.props.label || child.props.id}
                headerButtonProps={{ "data-id": `tab-header-${child.props.id}` }}
                children={child}
            />;
        })
    })
};
