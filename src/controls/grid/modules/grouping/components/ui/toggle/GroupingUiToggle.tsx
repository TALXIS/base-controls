import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { GroupingUiToggleComponents, IGroupingUiToggleComponents } from "./components";
import { getGroupingUiToggleStyles } from "./styles";

export interface IGroupingUiToggleProps {
    isExpanded: boolean;
    onToggle: () => void;
    components?: Partial<IGroupingUiToggleComponents>;
}

/** The chevron that opens and closes one group. */
export const GroupingUiToggle = (props: IGroupingUiToggleProps) => {
    const components = { ...GroupingUiToggleComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGroupingUiToggleStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.container,
        children: components.onRenderButton({
            isExpanded: props.isExpanded,
            iconProps: { iconName: props.isExpanded ? 'ChevronDown' : 'ChevronRight' },
            styles: { root: styles.button, icon: styles.icon, iconHovered: styles.iconHovered, iconPressed: styles.iconPressed },
            onClick: props.onToggle,
        }),
    });
};
