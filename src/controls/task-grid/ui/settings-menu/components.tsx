import { CommandBarButton, IButtonProps, ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of the settings menu. */
export interface ITaskGridUiSettingsMenuComponents {
    /** The tooltip that shows the button's text while the header is compact. */
    onRender: (props: ITooltipHostProps) => JSX.Element | null;
    /** The button with the toggles as its `menuProps.items`. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link ITaskGridUiSettingsMenuComponents}. */
export const TaskGridUiSettingsMenuComponents: ITaskGridUiSettingsMenuComponents = {
    onRender: props => <TooltipHost {...props} />,
    onRenderButton: props => <CommandBarButton {...props} />,
};
