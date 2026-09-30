import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getClassNames, IAlignment } from "@utils";
import { CellUiLockIconComponents, ICellUiLockIconComponents } from "./components";
import { getCellUiLockIconStyles } from "./styles";

export interface ICellUiLockIconProps {
    /** Why the value cannot be changed, shown in the tooltip. */
    message?: string;
    /** Which edge the cell's value reads from. */
    alignment?: IAlignment;
    /** Put on the icon's root, alongside its own class. */
    className?: string;
    components?: Partial<ICellUiLockIconComponents>;
}

/** What says a cell's value cannot be changed. */
export const CellUiLockIcon = (props: ICellUiLockIconProps) => {
    const theme = useTheme();
    const { alignment = 'left' } = props;
    const styles = useMemo(() => getCellUiLockIconStyles(theme, alignment), [theme, alignment]);
    const components = { ...CellUiLockIconComponents, ...props.components };

    //`TooltipHost` is styled by `hostClassName`, not `className`
    return components.onRenderTooltip({
        content: props.message,
        hostClassName: getClassNames([styles.root, props.className]),
        children: components.onRenderIcon({ iconName: 'Lock', className: styles.icon, 'aria-label': props.message }),
    });
};
