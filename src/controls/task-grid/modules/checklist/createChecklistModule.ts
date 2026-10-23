import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { Checklist, IChecklistParameters } from "./Checklist";

/** Each task's checklist progress; goes in `TaskDatasetControl`'s `modules`. */
export interface IChecklistModule extends IDatasetControlModule<'checklist'> { }

/** Shows each task's checklist items as `done/total`, loaded through its store. */
export const createChecklistModule = (parameters: IChecklistParameters): IChecklistModule => ({
    name: 'checklist',
    onLoad: datasetControl => new Checklist(datasetControl.parts.get('taskRuntime'), parameters),
    onDestroy: checklist => checklist.destroy(),
});
