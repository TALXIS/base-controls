import { DefaultButton, IButtonProps, IPanelProps } from "@fluentui/react";
import { Panel } from "@ui/surfaces/panel/Panel";

/** The replaceable pieces of the panel the user's views are managed in. */
export interface IManageViewsPanelUiComponents {
    onRenderPanel: (props: IPanelProps) => JSX.Element | null;
    onRenderCloseButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IManageViewsPanelUiComponents}. */
export const ManageViewsPanelUiComponents: IManageViewsPanelUiComponents = {
    onRenderPanel: props => <Panel {...props} />,
    onRenderCloseButton: props => <DefaultButton {...props} />,
};
