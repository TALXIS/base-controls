import { simulateBackend } from "../../../../../runtime/data-sources/memory/simulateBackend";
import type { INonWorkingDay, INonWorkingDaysParameters, INonWorkingDaysStore } from "../NonWorkingDays";
import { createNonWorkingDaysModule, INonWorkingDaysModule } from "../createNonWorkingDaysModule";

export interface IMemoryNonWorkingDaysModuleParameters<TData> extends Omit<INonWorkingDaysParameters<TData>, 'onCreateStore'> {
    nonWorkingDays: INonWorkingDay<TData>[];
}

class MemoryNonWorkingDaysStore<TData> implements INonWorkingDaysStore<TData> {
    private _nonWorkingDays: INonWorkingDay<TData>[];

    constructor(nonWorkingDays: INonWorkingDay<TData>[]) {
        this._nonWorkingDays = nonWorkingDays;
    }

    public async onLoadNonWorkingDays(): Promise<INonWorkingDay<TData>[]> {
        await simulateBackend();
        return this._nonWorkingDays;
    }
}

/** Non-working days held in memory. */
export const createMemoryNonWorkingDaysModule = <TData,>(parameters: IMemoryNonWorkingDaysModuleParameters<TData>): INonWorkingDaysModule => {
    const { nonWorkingDays, ...moduleParameters } = parameters;
    return createNonWorkingDaysModule<TData>({ ...moduleParameters, onCreateStore: () => new MemoryNonWorkingDaysStore(nonWorkingDays) });
};
