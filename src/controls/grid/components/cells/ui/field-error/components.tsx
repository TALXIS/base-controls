import { Icon, IIconProps, ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of what a cell says about an invalid value. */
export interface ICellUiFieldErrorComponents {
    /** What marks the cell's edges. */
    onRenderOutline: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    /** What carries the reason and holds the icon. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element;
    onRenderIcon: (props: IIconProps) => JSX.Element;
}

/** The defaults for {@link ICellUiFieldErrorComponents}. */
export const CellUiFieldErrorComponents: ICellUiFieldErrorComponents = {
    onRenderOutline: props => <div {...props} />,
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderIcon: props => <Icon {...props} />,
};
