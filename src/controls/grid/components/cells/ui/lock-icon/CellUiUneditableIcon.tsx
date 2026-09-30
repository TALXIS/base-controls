import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { IAlignment } from "@utils";
import { CellUiUneditableIconComponents, ICellUiUneditableIconComponents } from "./components";
import { getCellUneditableIconStyles } from "./styles";

export interface ICellUiUneditableIconProps {
    /** Why the value cannot be changed, shown in the tooltip. */
    message?: string;
    /** Which edge the cell's value reads from. */
    alignment?: IAlignment;
    components?: Partial<ICellUiUneditableIconComponents>;
}

/** What says a cell's value cannot be changed. */
export const CellUiUneditableIcon = (props: ICellUiUneditableIconProps) => {
    const theme = useTheme();
    const { alignment = 'left' } = props;
    const styles = useMemo(() => getCellUneditableIconStyles(theme, alignment), [theme, alignment]);
    const components = { ...CellUiUneditableIconComponents, ...props.components };

    //`TooltipHost` is styled by `hostClassName`, not `className`
    return components.onRenderTooltip({
        content: props.message,
        hostClassName: styles.root,
        children: components.onRenderIcon({ iconName: 'Lock', className: styles.icon, 'aria-label': props.message }),
    });
};
