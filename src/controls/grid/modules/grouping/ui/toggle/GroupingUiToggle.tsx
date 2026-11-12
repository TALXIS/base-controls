import { useTheme } from "@theme";
import { useMemo } from "react";

import { GroupingUiToggleComponents, IGroupingUiToggleComponents } from "./components";
import { getClassNames } from "@core";
import { getGroupingUiToggleStyles, GROUPING_TOGGLE_CLASS } from "./styles";

export interface IGroupingUiToggleProps {
    isExpanded: boolean;
    /** Accessible name and tooltip while the row is closed. */
    expandText?: string;
    /** Accessible name and tooltip while the row is open. */
    collapseText?: string;
    onToggle: () => void;
    components?: Partial<IGroupingUiToggleComponents>;
}

/** The chevron that opens and closes one group. */
export const GroupingUiToggle = (props: IGroupingUiToggleProps) => {
    const components = { ...GroupingUiToggleComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGroupingUiToggleStyles(theme), [theme]);

    return components.onRender({
        className: getClassNames([GROUPING_TOGGLE_CLASS, styles.container]),
        children: components.onRenderButton({
            isExpanded: props.isExpanded,
            iconProps: { iconName: props.isExpanded ? 'ChevronDown' : 'ChevronRight' },
            ariaLabel: props.isExpanded ? props.collapseText : props.expandText,
            title: props.isExpanded ? props.collapseText : props.expandText,
            'aria-expanded': props.isExpanded,
            styles: { root: styles.button, icon: styles.icon, iconHovered: styles.iconHovered, iconPressed: styles.iconPressed },
            onClick: props.onToggle,
        }),
    });
};
