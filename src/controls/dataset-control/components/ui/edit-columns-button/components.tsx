import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of the Edit Columns button. */
export interface IEditColumnsButtonUiComponents {
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IEditColumnsButtonUiComponents}. */
export const EditColumnsButtonUiComponents: IEditColumnsButtonUiComponents = {
    onRenderButton: props => <CommandBarButton {...props} />,
};
