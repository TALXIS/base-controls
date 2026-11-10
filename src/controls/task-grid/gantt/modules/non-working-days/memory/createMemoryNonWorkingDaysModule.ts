import dayjs from "dayjs";
import type { MemoryTable } from "@core/state";
import { simulateBackend } from "../../../../runtime/data-sources/memory/simulateBackend";
import type { INonWorkingDay, INonWorkingDaysParameters, INonWorkingDaysStore } from "../NonWorkingDays";
import { createNonWorkingDaysModule, INonWorkingDaysModule } from "../createNonWorkingDaysModule";

/** A non-working day as a row of the `nonWorkingDays` table, its dates as ISO strings. */
export interface IMemoryNonWorkingDay<TData = { [key: string]: unknown }> extends Omit<INonWorkingDay<TData>, 'date' | 'endDate'> {
    date: string;
    endDate?: string;
}

export interface IMemoryNonWorkingDaysModuleParameters<TData> extends Omit<INonWorkingDaysParameters<TData>, 'createStore'> {
    nonWorkingDays: MemoryTable<IMemoryNonWorkingDay<TData>>;
}

class MemoryNonWorkingDaysStore<TData> implements INonWorkingDaysStore<TData> {
    private _nonWorkingDays: MemoryTable<IMemoryNonWorkingDay<TData>>;

    constructor(nonWorkingDays: MemoryTable<IMemoryNonWorkingDay<TData>>) {
        this._nonWorkingDays = nonWorkingDays;
    }

    public async loadNonWorkingDays(): Promise<INonWorkingDay<TData>[]> {
        await simulateBackend();
        return this._nonWorkingDays.getRows().map(({ date, endDate, ...day }) => ({ ...day, date: dayjs(date), endDate: endDate ? dayjs(endDate) : undefined }));
    }
}

/** Non-working days kept in the `nonWorkingDays` table you pass. */
export const createMemoryNonWorkingDaysModule = <TData,>(parameters: IMemoryNonWorkingDaysModuleParameters<TData>): INonWorkingDaysModule => {
    const { nonWorkingDays, ...moduleParameters } = parameters;
    return createNonWorkingDaysModule<TData>({ ...moduleParameters, createStore: () => new MemoryNonWorkingDaysStore(nonWorkingDays) });
};
