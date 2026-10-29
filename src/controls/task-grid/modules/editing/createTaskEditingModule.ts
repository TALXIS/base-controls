import { createEditingModule, IEditingModule, IEditingModuleOptions } from "@controls/grid";

declare const TASK_EDITING: unique symbol;

/** The task grid's editing module, which saves every edit at once; goes in `TaskGrid`'s `modules`. */
export interface ITaskEditingModule extends IEditingModule {
    readonly [TASK_EDITING]: true;
}

/** Lets the task grid's cells be edited, saving each edit straight away. */
export const createTaskEditingModule = (options?: Omit<IEditingModuleOptions, 'autoSave'>): ITaskEditingModule => {
    return createEditingModule({ ...options, autoSave: true }) as ITaskEditingModule;
};
