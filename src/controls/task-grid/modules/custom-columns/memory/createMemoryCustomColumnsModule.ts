import type { MemoryTable } from "@core/state";
import { createCustomColumnsModule, ICustomColumnsModule } from "../createCustomColumnsModule";
import type { ICustomColumnsParameters } from "../CustomColumns";
import { ICustomColumnRow, ICustomColumnValuesRow, MemoryCustomColumnsStore } from "./MemoryCustomColumnsStore";

export interface IMemoryCustomColumnsModuleParameters extends Omit<ICustomColumnsParameters, 'createStore' | 'enableEditing'> {
    /** Keyed by `name`. */
    columns: MemoryTable<ICustomColumnRow>;
    /** Keyed by `taskId`. */
    values: MemoryTable<ICustomColumnValuesRow>;
}

/** The user's own task columns kept in the `columns` and `values` tables you pass. */
export const createMemoryCustomColumnsModule = (parameters: IMemoryCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { columns, values, ...moduleParameters } = parameters;
    return createCustomColumnsModule({ ...moduleParameters, enableEditing: false, createStore: taskRuntime => new MemoryCustomColumnsStore({ taskRuntime, columns, values }) });
};
