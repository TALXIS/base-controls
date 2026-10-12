import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of the page size switcher. */
export interface IPageSizeSwitcherUiComponents {
    /** The button; its `menuProps.items` are the page sizes. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IPageSizeSwitcherUiComponents}. */
export const PageSizeSwitcherUiComponents: IPageSizeSwitcherUiComponents = {
    onRenderButton: props => <CommandBarButton {...props} />,
};
