import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ITemplatesParameters, Templates } from "./Templates";

/** Task templates, for `TaskDatasetControl`'s `modules`. */
export interface ITemplatesModule extends IDatasetControlModule<'templates'> { }

/** Offers New › From template and Save as template in the ribbon and on each row. */
export const createTemplatesModule = (parameters: ITemplatesParameters): ITemplatesModule => ({
    name: 'templates',
    onLoad: datasetControl => new Templates(datasetControl.modules.get('taskRuntime'), parameters),
    onDestroy: templates => templates.destroy(),
});
