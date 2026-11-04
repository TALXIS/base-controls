import { useMemo } from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { useSurfaceMenuProps, useCompact } from "@ui";
import { ITaskGridUiSettingsMenuComponents, TaskGridUiSettingsMenuComponents } from "./components";
import { getTaskGridUiSettingsMenuStyles } from "./styles";

export interface ITaskGridUiSettingsMenuProps {
    /** The button's text, only its tooltip while the header is compact. */
    text: string;
    /** The toggles. */
    items: IContextualMenuItem[];
    disabled?: boolean;
    /** Called as the menu opens. */
    onMenuOpen?: () => void;
    components?: Partial<ITaskGridUiSettingsMenuComponents>;
}

/** A button opening a menu of toggles. */
export const TaskGridUiSettingsMenu = (props: ITaskGridUiSettingsMenuProps) => {
    const components = { ...TaskGridUiSettingsMenuComponents, ...props.components };
    const styles = useMemo(() => getTaskGridUiSettingsMenuStyles(), []);
    const isCompact = useCompact();
    const menuProps = useSurfaceMenuProps({ items: props.items });

    return components.onRenderTooltip({
        content: isCompact ? props.text : undefined,
        setAriaDescribedBy: false,
        hostClassName: styles.tooltipHost,
        children: components.onRenderButton({
            className: styles.settingsButton,
            text: isCompact ? undefined : props.text,
            ariaLabel: props.text,
            iconProps: { iconName: 'Settings' },
            menuProps,
            onMenuClick: props.onMenuOpen,
            disabled: props.disabled,
        }),
    });
};
