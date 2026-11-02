import type { IGanttNonWorkingDay, IGanttNonWorkingDaysParameters, IGanttNonWorkingDaysStore } from "../GanttNonWorkingDays";
import { createGanttNonWorkingDaysModule, IGanttNonWorkingDaysModule } from "../createGanttNonWorkingDaysModule";

export interface IMemoryGanttNonWorkingDaysModuleParameters<TData> extends Omit<IGanttNonWorkingDaysParameters<TData>, 'onCreateStore'> {
    nonWorkingDays: IGanttNonWorkingDay<TData>[];
}

class MemoryGanttNonWorkingDaysStore<TData> implements IGanttNonWorkingDaysStore<TData> {
    private _nonWorkingDays: IGanttNonWorkingDay<TData>[];

    constructor(nonWorkingDays: IGanttNonWorkingDay<TData>[]) {
        this._nonWorkingDays = nonWorkingDays;
    }

    public async onLoadNonWorkingDays(): Promise<IGanttNonWorkingDay<TData>[]> {
        return this._nonWorkingDays;
    }
}

/** Non-working days held in memory. */
export const createMemoryGanttNonWorkingDaysModule = <TData,>(parameters: IMemoryGanttNonWorkingDaysModuleParameters<TData>): IGanttNonWorkingDaysModule => {
    const { nonWorkingDays, ...moduleParameters } = parameters;
    return createGanttNonWorkingDaysModule<TData>({ ...moduleParameters, onCreateStore: () => new MemoryGanttNonWorkingDaysStore(nonWorkingDays) });
};
