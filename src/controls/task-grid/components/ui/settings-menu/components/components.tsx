import { CommandBarButton, IButtonProps, ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of the settings menu. */
export interface ISettingsMenuComponents {
    /** The tooltip around the button, which shows its text while the header is compact. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element | null;
    /** The button; its `menuProps.items` are the toggles. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link ISettingsMenuComponents}. */
export const SettingsMenuComponents: ISettingsMenuComponents = {
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderButton: props => <CommandBarButton {...props} />,
};
