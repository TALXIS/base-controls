import { useMemo } from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useSurfaceMenuProps } from "@ui";
import { useCompact, useDataProviderEvents } from "@utils";
import { useTaskRuntime } from "../context";
import { ISettingsComponents, SettingsComponents } from "./components";
import { getSettingsStyles } from "./styles";

/** Props for `TaskDatasetControl.Settings`. */
export interface ISettingsProps {
    components?: Partial<ISettingsComponents>;
}

/** A menu of the task grid's toggles, such as Show hierarchy, and those its modules add. */
export const Settings = (props: ISettingsProps) => {
    const taskRuntime = useTaskRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const components = { ...SettingsComponents, ...props.components };
    const styles = useMemo(() => getSettingsStyles(), []);
    const isCompact = useCompact();
    const { rerender } = useRerender();

    const items = taskRuntime.getSettings().map((setting): IContextualMenuItem => ({
        key: setting.key,
        text: setting.label,
        canCheck: true,
        checked: setting.isChecked,
        onClick: () => {
            setting.onChange(!setting.isChecked);
            rerender();
        },
    }));
    const menuProps = useSurfaceMenuProps({ items });

    if (items.length === 0) {
        return null;
    }
    const text = taskRuntime.getLabels().getLocalizedString('settings');
    return components.onRenderTooltip({
        content: isCompact ? text : undefined,
        setAriaDescribedBy: false,
        hostClassName: styles.tooltipHost,
        children: components.onRenderButton({
            className: styles.settingsButton,
            text: isCompact ? undefined : text,
            ariaLabel: text,
            iconProps: { iconName: 'Settings' },
            menuProps,
            //the settings are read as the menu opens, so it shows them as they are now
            onMenuClick: rerender,
            disabled: provider.isLoading(),
        }),
    });
};
