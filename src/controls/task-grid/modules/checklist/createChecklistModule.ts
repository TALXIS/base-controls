import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { Checklist, IChecklistParameters } from "./Checklist";

/** Each task's checklist progress; goes in `TaskDatasetControl`'s `modules`. */
export interface IChecklistModule extends IDatasetControlModule<'checklist'> { }

/** Shows the items `onGetItems` reads off each task as `done/total`. */
export const createChecklistModule = (parameters: IChecklistParameters): IChecklistModule => ({
    name: 'checklist',
    onLoad: datasetControl => new Checklist(datasetControl.parts.get('taskDatasetControl'), parameters),
    onDestroy: checklist => checklist.destroy(),
});
