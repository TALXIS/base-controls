import { Icon, IIconProps, ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of what says a cell's value cannot be changed. */
export interface ICellUiUneditableIconComponents {
    /** What carries the message and holds the icon. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element;
    onRenderIcon: (props: IIconProps) => JSX.Element;
}

/** The defaults for {@link ICellUiUneditableIconComponents}. */
export const CellUiUneditableIconComponents: ICellUiUneditableIconComponents = {
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderIcon: props => <Icon {...props} />,
};
