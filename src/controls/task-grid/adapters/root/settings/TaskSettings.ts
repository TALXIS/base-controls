import { HookRegistry } from "@core";
import type { LabelsOf } from "@labels";
import { TASK_GRID_LABELS } from "../../../labels";
import type { ITaskRuntime } from "../../../runtime";
import { runQuietly } from "../../../runtime/runQuietly";
import type { ISettingsProps } from "../../settings";

/** A toggle in `TaskDatasetControl.Settings`. */
export interface ITaskGridSetting {
    key: string;
    label: string;
    isChecked: boolean;
    onChange: (isChecked: boolean) => void;
}

/** A hook that adds to or changes the toggles `TaskDatasetControl.Settings` shows. */
export type TaskGridSettingsHook = (settings: ITaskGridSetting[]) => void;

/** The toggles of `TaskDatasetControl.Settings`, the `taskSettings` part. */
export interface ITaskSettings {
    /**
     * Adds a hook over the toggles the menu shows.
     * @param priority Ascending: a higher number runs later.
     */
    addSettingsHook(hook: TaskGridSettingsHook, priority?: number): () => void;
    getSettings(): ITaskGridSetting[];
}

export interface ITaskSettingsParameters {
    taskRuntime: ITaskRuntime;
    getProps: () => ISettingsProps;
}

export class TaskSettings implements ITaskSettings {
    private _taskRuntime: ITaskRuntime;
    private _getProps: () => ISettingsProps;
    private _settingsHooks = new HookRegistry<TaskGridSettingsHook>();

    constructor(parameters: ITaskSettingsParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._getProps = parameters.getProps;
    }

    private get _labels(): LabelsOf<typeof TASK_GRID_LABELS> {
        return this._taskRuntime.getLabels(TASK_GRID_LABELS);
    }

    public addSettingsHook(hook: TaskGridSettingsHook, priority?: number): () => void {
        return this._settingsHooks.add(hook, priority);
    }

    public getSettings(): ITaskGridSetting[] {
        const settings: ITaskGridSetting[] = [];
        const props = this._getProps();
        if (props.enableShowHierarchy !== false) {
            settings.push({
                key: 'showHierarchy',
                label: this._labels.get('taskGrid.showHierarchy'),
                isChecked: !this._taskRuntime.isFlatList(),
                onChange: isChecked => this._taskRuntime.setFlatList(!isChecked),
            });
        }
        if (props.enableHideInactiveTasks !== false) {
            const provider = this._taskRuntime.getProvider();
            settings.push({
                key: 'hideInactiveTasks',
                label: this._labels.get('taskGrid.hideInactiveTasks'),
                isChecked: provider.areInactiveTasksHidden(),
                onChange: isChecked => { runQuietly(() => provider.setInactiveTasksHidden(isChecked)); },
            });
        }
        this._settingsHooks.apply(settings);
        return settings;
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** `TaskDatasetControl.Settings`. */
        taskSettings: ITaskSettings;
    }
}
