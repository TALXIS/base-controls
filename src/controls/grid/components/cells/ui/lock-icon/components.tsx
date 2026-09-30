import { Icon, IIconProps, ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of what says a cell's value cannot be changed. */
export interface ICellUiLockIconComponents {
    /** What carries the message and holds the icon. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element;
    onRenderIcon: (props: IIconProps) => JSX.Element;
}

/** The defaults for {@link ICellUiLockIconComponents}. */
export const CellUiLockIconComponents: ICellUiLockIconComponents = {
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderIcon: props => <Icon {...props} />,
};
