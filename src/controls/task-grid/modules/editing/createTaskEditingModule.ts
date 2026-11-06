import { createEditingModule, IEditingModule, IEditingModuleParameters } from "@controls/grid";

declare const TASK_EDITING: unique symbol;

/** The task grid's editing module that saves every edit at once. */
export interface ITaskEditingModule extends IEditingModule {
    readonly [TASK_EDITING]: true;
}

/** Lets the task grid's cells be edited, saving each edit straight away. */
export const createTaskEditingModule = (parameters?: Omit<IEditingModuleParameters, 'autoSave'>): ITaskEditingModule => {
    return createEditingModule({ ...parameters, enableAutoSave: true }) as ITaskEditingModule;
};

declare module "@controls/task-grid/interfaces" {
    interface ITaskGridGridModuleMap {
        editing: ITaskEditingModule;
    }
}
