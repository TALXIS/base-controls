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
    const theme = useTheme();
    const styles = useMemo(() => getGroupingUiToggleStyles(theme), [theme]);
    const components = { ...GroupingUiToggleComponents, ...props.components };

    return components.onRenderCommands({
        alignment: 'right',
        className: styles.commands,
        items: [{
            key: 'groupExpansion',
            iconOnly: true,
            iconProps: { iconName: props.isExpanded ? 'ChevronDown' : 'ChevronRight' },
            buttonStyles: styles.chevronStyles,
            onClick: props.onToggle,
        }],
    });
};
