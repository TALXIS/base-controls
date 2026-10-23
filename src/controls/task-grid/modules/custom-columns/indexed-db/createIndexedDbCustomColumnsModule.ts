import { createCustomColumnsModule, ICustomColumnsModule } from "../createCustomColumnsModule";
import type { ICustomColumnsParameters } from "../CustomColumns";
import { ICustomColumnDefinition, IndexedDbCustomColumnsStore } from "./IndexedDbCustomColumnsStore";

export interface IIndexedDbCustomColumnsModuleParameters extends Omit<ICustomColumnsParameters, 'onCreateStore'> {
    /** The IndexedDB database the columns and their values are kept in; one per control. */
    databaseName: string;
    /** The columns a new database starts with. */
    columns?: ICustomColumnDefinition[];
}

/** The user's own task columns kept in the browser's IndexedDB; an example implementation. */
export const createIndexedDbCustomColumnsModule = (parameters: IIndexedDbCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { databaseName, columns, ...moduleParameters } = parameters;
    return createCustomColumnsModule({ ...moduleParameters, onCreateStore: () => new IndexedDbCustomColumnsStore({ databaseName, columns }) });
};
