import type { IChecklistParameters } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";
import { TalxisChecklistStore } from "./TalxisChecklistStore";

export interface ITalxisChecklistModuleParameters extends Omit<IChecklistParameters, 'onCreateStore'> { }

/** Checklists stored as JSON on each TALXIS task. */
export const createTalxisChecklistModule = (parameters: ITalxisChecklistModuleParameters = {}): IChecklistModule => {
    return createChecklistModule({ reloadOnEditorClosed: true, ...parameters, onCreateStore: taskRuntime => new TalxisChecklistStore(taskRuntime) });
};
