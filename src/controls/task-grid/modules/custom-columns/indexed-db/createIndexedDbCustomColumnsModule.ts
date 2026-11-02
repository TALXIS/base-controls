import { createCustomColumnsModule, ICustomColumnsModule } from "../createCustomColumnsModule";
import type { ICustomColumnsParameters } from "../CustomColumns";
import { ICustomColumnDefinition, IndexedDbCustomColumnsStore } from "./IndexedDbCustomColumnsStore";

export interface IIndexedDbCustomColumnsModuleParameters extends Omit<ICustomColumnsParameters, 'onCreateStore' | 'enableEditing'> {
    /** The IndexedDB database of one control's columns and values. */
    databaseName: string;
    /** The columns a new database starts with. */
    columns?: ICustomColumnDefinition[];
}

/** The user's own task columns kept in the browser's IndexedDB. */
export const createIndexedDbCustomColumnsModule = (parameters: IIndexedDbCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { databaseName, columns, ...moduleParameters } = parameters;
    return createCustomColumnsModule({ ...moduleParameters, enableEditing: false, onCreateStore: taskRuntime => new IndexedDbCustomColumnsStore({ taskRuntime, databaseName, columns }) });
};
