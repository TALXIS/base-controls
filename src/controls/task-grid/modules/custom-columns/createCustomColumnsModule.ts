import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { CustomColumns, ICustomColumns, ICustomColumnsParameters } from "./CustomColumns";

/** The user's own task columns, for `TaskDatasetControl`'s `modules`. */
export interface ICustomColumnsModule extends IDatasetControlModule<'customColumns'> { }

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** The user's own task columns. */
        customColumns: ICustomColumns;
    }
}

/** The user's own task columns, loaded on every mount before the tasks. */
export const createCustomColumnsModule = (parameters: ICustomColumnsParameters): ICustomColumnsModule => ({
    name: 'customColumns',
    onLoad: async datasetControl => {
        const customColumns = new CustomColumns(datasetControl.parts.get('taskRuntime'), parameters);
        await customColumns.load();
        return customColumns;
    },
    onDestroy: customColumns => customColumns.destroy(),
});
