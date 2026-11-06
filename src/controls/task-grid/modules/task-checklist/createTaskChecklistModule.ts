import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { TaskChecklist, ITaskChecklistParameters } from "./TaskChecklist";

/** Each task's checklist progress, for `TaskDatasetControl`'s `modules`. */
export interface ITaskChecklistModule extends IDatasetControlModule<'taskChecklist'> { }

/** Shows each task's checklist items as `done/total`, loaded through its store. */
export const createTaskChecklistModule = (parameters: ITaskChecklistParameters): ITaskChecklistModule => ({
    name: 'taskChecklist',
    onLoad: datasetControl => new TaskChecklist(datasetControl.modules.get('taskRuntime'), parameters),
    onDestroy: checklist => checklist.destroy(),
});
