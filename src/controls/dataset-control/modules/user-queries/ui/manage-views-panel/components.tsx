import { DefaultButton, IButtonProps, IPanelProps } from "@fluentui/react";
import { Panel } from "@ui/surfaces/panel/Panel";

/** The replaceable pieces of the panel the user's views are managed in. */
export interface IUserQueriesUiManageViewsPanelComponents {
    onRenderPanel: (props: IPanelProps) => JSX.Element | null;
    onRenderCloseButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IUserQueriesUiManageViewsPanelComponents}. */
export const UserQueriesUiManageViewsPanelComponents: IUserQueriesUiManageViewsPanelComponents = {
    onRenderPanel: props => <Panel {...props} />,
    onRenderCloseButton: props => <DefaultButton {...props} />,
};
