import { Icon, IContextualMenuItem, Text, useTheme } from "@fluentui/react";
import { useMemo } from "react";
import { getMenuSectionStyles } from "./styles";
import { getClassNames } from "../../../..";
import { useViewSwitcherLabels } from "../../context";

interface IMenuSectionProps {
    items: IContextualMenuItem[];
    label?: string;
    iconName?: string;
    itemRenderer?: (item: IContextualMenuItem) => JSX.Element;
}

export const MenuSection = (props: IMenuSectionProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getMenuSectionStyles(theme), []);
    const labels = useViewSwitcherLabels();

    const { items, label, iconName, itemRenderer } = props;
        const headerClassNames = getClassNames([styles.menuSectionHeader, ...(label || iconName ? [styles.menuSectionHeaderPadding] : [])]);
        return <>
            <div className={headerClassNames}>
                {iconName && <Icon className={styles.menuSectionHeaderLabel} iconName={iconName} />}
                {label && <Text className={styles.menuSectionHeaderLabel}>{label}</Text>}
            </div>
            <div className={styles.menuSectionContent}>
                {items.map(item => itemRenderer?.({
                    ...item,
                    onRenderIcon: item['data-is-default'] ? () => {
                        return <Text className={styles.defaultViewLabel}>{labels.default}</Text>
                    } : undefined
                }))}
            </div>
        </>

}

