import { IContextualMenuItem } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useDataProviderEvents, useLabels, useLocalization } from "@utils";
import { useLatest } from "@hooks";
import { ISettingsMenuComponents, SettingsMenu } from "../../components/ui/settings-menu";
import { useDatasetControlPart } from "@controls/dataset-control/components/adapters/root/useDatasetControlPart";
import { useTaskRuntime } from "../context";
import { TASK_GRID_LABELS } from "../../labels";
import { TaskSettings } from "./TaskSettings";

/** Props for `TaskDatasetControl.Settings`. */
export interface ISettingsProps {
    /** The Show hierarchy toggle; on unless set to `false`. */
    enableShowHierarchy?: boolean;
    /** The Hide inactive tasks toggle; on unless set to `false`. */
    enableHideInactiveTasks?: boolean;
    components?: Partial<ISettingsMenuComponents>;
}

/** A menu of the task grid's toggles, such as Show hierarchy, and those its modules add. */
export const Settings = (props: ISettingsProps) => {
    const taskRuntime = useTaskRuntime();
    const propsRef = useLatest(props);
    const localization = useLocalization();
    const labels = useLabels(TASK_GRID_LABELS);
    const settings = useDatasetControlPart('taskSettings', () => new TaskSettings({ taskRuntime, localization, onGetProps: () => propsRef.current }));
    const provider = useDataProviderEvents(['onLoading']);
    const { rerender } = useRerender();

    const items = settings.getSettings().map((setting): IContextualMenuItem => ({
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
        text={labels.get('taskGrid.settings')}
        items={items}
        disabled={provider.isLoading()}
        //the settings are read as the menu opens, so it shows them as they are now
        onMenuOpen={rerender}
        components={props.components} />;
};
