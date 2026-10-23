import { useMemo } from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { useSurfaceMenuProps } from "@ui";
import { useCompact } from "@utils";
import { ISettingsMenuComponents, SettingsMenuComponents } from "./components";
import { getSettingsMenuStyles } from "./styles";

export interface ISettingsMenuProps {
    /** The button's text; only its tooltip while the header is compact. */
    text: string;
    /** The toggles. */
    items: IContextualMenuItem[];
    disabled?: boolean;
    /** Called as the menu opens. */
    onMenuOpen?: () => void;
    components?: Partial<ISettingsMenuComponents>;
}

/** A button opening a menu of toggles. */
export const SettingsMenu = (props: ISettingsMenuProps) => {
    const components = { ...SettingsMenuComponents, ...props.components };
    const styles = useMemo(() => getSettingsMenuStyles(), []);
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
