import { CommandBarButton, IButtonProps, ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of the Edit Columns button. */
export interface IEditColumnsButtonUiComponents {
    /** The tooltip around the button, which shows its text while the button is compact. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element | null;
    /** The button. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IEditColumnsButtonUiComponents}. */
export const EditColumnsButtonUiComponents: IEditColumnsButtonUiComponents = {
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderButton: props => <CommandBarButton {...props} />,
};
