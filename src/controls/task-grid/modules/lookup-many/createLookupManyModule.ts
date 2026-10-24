import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ILookupManyColumn, ILookupManyParameters, LookupMany } from "./LookupMany";

/** Columns holding several related records; goes in `TaskDatasetControl`'s `modules`. */
export interface ILookupManyModule extends IDatasetControlModule<'lookupMany'> { }

/** Holds the columns in `columns`, drawn as pills and picked in a pop-out editor. */
export const createLookupManyModule = <TColumn extends ILookupManyColumn>(parameters: ILookupManyParameters<TColumn>): ILookupManyModule => ({
    name: 'lookupMany',
    onLoad: datasetControl => new LookupMany(datasetControl.parts.get('taskRuntime'), parameters),
    onDestroy: lookupMany => lookupMany.destroy(),
});
