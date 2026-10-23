import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ILookupManyColumn, ILookupManyParameters, LookupMany } from "./LookupMany";

/** Columns holding several related records; goes in `TaskDatasetControl`'s `modules`. */
export interface ILookupManyModule extends IDatasetControlModule<'lookupMany'> { }

/** Draws the columns in `columns` as pills picked in a pop-out editor. */
export const createLookupManyModule = <TColumn extends ILookupManyColumn>(parameters: ILookupManyParameters<TColumn>): ILookupManyModule => ({
    name: 'lookupMany',
    onLoad: datasetControl => new LookupMany(datasetControl.parts.get('taskRuntime'), parameters),
});
