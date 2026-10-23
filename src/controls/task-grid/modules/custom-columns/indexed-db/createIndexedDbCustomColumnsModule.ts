import type { ICustomColumnsModule } from "../createCustomColumnsModule";
import { CustomColumns, ICustomColumnsParameters } from "../CustomColumns";
import { ICustomColumnDefinition, IndexedDbCustomColumnsStrategy } from "./IndexedDbCustomColumnsStrategy";

export interface IIndexedDbCustomColumnsModuleParameters extends Omit<ICustomColumnsParameters, 'strategy'> {
    /** The IndexedDB database the columns and their values are kept in; one per control. */
    databaseName: string;
    /** The columns a new database starts with. */
    columns?: ICustomColumnDefinition[];
}

/** The user's own task columns kept in the browser's IndexedDB; an example implementation. */
export const createIndexedDbCustomColumnsModule = (parameters: IIndexedDbCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { databaseName, columns, ...moduleParameters } = parameters;
    return {
        name: 'customColumns',
        onLoad: async datasetControl => {
            const strategy = new IndexedDbCustomColumnsStrategy({ databaseName, columns });
            const customColumns = new CustomColumns(datasetControl.parts.get('taskDatasetControl'), { ...moduleParameters, strategy });
            await customColumns.load();
            return customColumns;
        },
        onDestroy: customColumns => customColumns.destroy(),
    };
};
