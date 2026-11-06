import type { ITaskChecklistParameters } from "../TaskChecklist";
import { createTaskChecklistModule, ITaskChecklistModule } from "../createTaskChecklistModule";
import { TalxisTaskChecklistStore } from "./TalxisTaskChecklistStore";

export interface ITalxisTaskChecklistModuleParameters extends Omit<ITaskChecklistParameters, 'createStore'> { }

/** Checklists stored as JSON on each TALXIS task. */
export const createTalxisTaskChecklistModule = (parameters: ITalxisTaskChecklistModuleParameters = {}): ITaskChecklistModule => {
    return createTaskChecklistModule({ reloadOnEditorClosed: true, ...parameters, createStore: taskRuntime => new TalxisTaskChecklistStore(taskRuntime) });
};
