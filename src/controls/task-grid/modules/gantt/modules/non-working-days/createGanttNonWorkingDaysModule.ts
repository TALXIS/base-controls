import type { IGanttModule } from "../../interfaces";
import { GanttNonWorkingDays, IGanttNonWorkingDaysParameters } from "./GanttNonWorkingDays";

export interface IGanttNonWorkingDaysModule extends IGanttModule<'nonWorkingDays'> { }

export const createGanttNonWorkingDaysModule = <TData,>(parameters: IGanttNonWorkingDaysParameters<TData> = {}): IGanttNonWorkingDaysModule => ({
    name: 'nonWorkingDays',
    onLoad: async gantt => {
        const nonWorkingDays = new GanttNonWorkingDays<TData>(gantt, parameters);
        await nonWorkingDays.reload();
        return nonWorkingDays as GanttNonWorkingDays<unknown>;
    },
    onDestroy: nonWorkingDays => nonWorkingDays.destroy(),
});
