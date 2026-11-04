import { IContextualMenuItem } from "@fluentui/react";
import { useRerender, useLatest } from "@core";
import { useLabels } from "@labels";
import { useDataProviderEvents } from "@data";
import { useDatasetControlPart } from "@controls/dataset-control";
import { ITaskGridUiSettingsMenuComponents, TaskGridUiSettingsMenu } from "../../ui";
import { useTaskRuntime } from "../root/context";
import { TASK_GRID_LABELS } from "../../labels";
import { TaskSettings } from "../root/settings";

/** Props for `TaskDatasetControl.Settings`. */
export interface ISettingsProps {
    /** The Show hierarchy toggle, on unless set to `false`. */
    enableShowHierarchy?: boolean;
    /** The Hide inactive tasks toggle, on unless set to `false`. */
    enableHideInactiveTasks?: boolean;
    components?: Partial<ITaskGridUiSettingsMenuComponents>;
}

/** A menu of the task grid's toggles, such as Show hierarchy, and those its modules add. */
export const Settings = (props: ISettingsProps) => {
    const taskRuntime = useTaskRuntime();
    const propsRef = useLatest(props);
    const labels = useLabels(TASK_GRID_LABELS);
    const settings = useDatasetControlPart('taskSettings', () => new TaskSettings({ taskRuntime, onGetProps: () => propsRef.current }));
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
    return <TaskGridUiSettingsMenu
        text={labels.get('taskGrid.settings')}
        items={items}
        disabled={provider.isLoading()}
        //reads the settings again as the menu opens
        onMenuOpen={rerender}
        components={props.components} />;
};
