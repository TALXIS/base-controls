import type { IGanttModule } from "../../interfaces";
import { NonWorkingDays, INonWorkingDaysParameters } from "./NonWorkingDays";

export interface INonWorkingDaysModule extends IGanttModule<'nonWorkingDays'> { }

export const createNonWorkingDaysModule = <TData,>(parameters: INonWorkingDaysParameters<TData> = {}): INonWorkingDaysModule => ({
    name: 'nonWorkingDays',
    onLoad: gantt => new NonWorkingDays<TData>(gantt, parameters) as NonWorkingDays<unknown>,
    onDestroy: nonWorkingDays => nonWorkingDays.destroy(),
});
