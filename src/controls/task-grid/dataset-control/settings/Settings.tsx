import { IContextualMenuItem } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useDataProviderEvents } from "@utils";
import { ISettingsMenuComponents, SettingsMenu } from "../../components/ui/settings-menu";
import { useTaskRuntime } from "../context";

/** Props for `TaskDatasetControl.Settings`. */
export interface ISettingsProps {
    components?: Partial<ISettingsMenuComponents>;
}

/** A menu of the task grid's toggles, such as Show hierarchy, and those its modules add. */
export const Settings = (props: ISettingsProps) => {
    const taskRuntime = useTaskRuntime();
    const provider = useDataProviderEvents(['onLoading']);
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

    if (items.length === 0) {
        return null;
    }
    return <SettingsMenu
        text={taskRuntime.getLabels().getLocalizedString('settings')}
        items={items}
        disabled={provider.isLoading()}
        //the settings are read as the menu opens, so it shows them as they are now
        onMenuOpen={rerender}
        components={props.components} />;
};
