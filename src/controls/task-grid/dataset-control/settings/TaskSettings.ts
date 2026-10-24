import { HookRegistry } from "@utils";
import type { ITaskRuntime } from "../../runtime";
import type { ISettingsProps } from "./Settings";

/** A toggle in `TaskDatasetControl.Settings`. */
export interface ITaskGridSetting {
    key: string;
    label: string;
    isChecked: boolean;
    onChange: (isChecked: boolean) => void;
}

/** A hook over the toggles `TaskDatasetControl.Settings` shows, which it adds to or changes in place. */
export type TaskGridSettingsHook = (settings: ITaskGridSetting[]) => void;

/** The toggles of `TaskDatasetControl.Settings`; reach it through `control.parts.whenAvailable('taskSettings', ...)`. */
export interface ITaskSettings {
    /**
     * Registers a hook over the toggles the menu shows.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void;
    getSettings(): ITaskGridSetting[];
}

export interface ITaskSettingsParameters {
    taskRuntime: ITaskRuntime;
    onGetProps: () => ISettingsProps;
}

export class TaskSettings implements ITaskSettings {
    private _taskRuntime: ITaskRuntime;
    private _onGetProps: () => ISettingsProps;
    private _settingsHooks = new HookRegistry<TaskGridSettingsHook>();

    constructor(parameters: ITaskSettingsParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._onGetProps = parameters.onGetProps;
    }

    public registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void {
        return this._settingsHooks.register(hook, priority);
    }

    public getSettings(): ITaskGridSetting[] {
        const settings: ITaskGridSetting[] = [];
        const props = this._onGetProps();
        const labels = this._taskRuntime.getLabels();
        if (props.enableShowHierarchy !== false) {
            settings.push({
                key: 'showHierarchy',
                label: labels.getLocalizedString('showHierarchy'),
                isChecked: !this._taskRuntime.isFlatList(),
                onChange: isChecked => this._taskRuntime.setFlatList(!isChecked),
            });
        }
        if (props.enableHideInactiveTasks !== false) {
            const provider = this._taskRuntime.getProvider();
            settings.push({
                key: 'hideInactiveTasks',
                label: labels.getLocalizedString('hideInactiveTasks'),
                isChecked: provider.areInactiveTasksHidden(),
                onChange: isChecked => provider.setInactiveTasksHidden(isChecked),
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
