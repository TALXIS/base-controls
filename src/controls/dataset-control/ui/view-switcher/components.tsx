import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of the view switcher. */
export interface IViewSwitcherUiComponents {
    /** The menu button; its `menuProps.items` are the views, for an override to add to. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IViewSwitcherUiComponents}. */
export const ViewSwitcherUiComponents: IViewSwitcherUiComponents = {
    onRenderButton: props => <CommandBarButton {...props} />,
};
