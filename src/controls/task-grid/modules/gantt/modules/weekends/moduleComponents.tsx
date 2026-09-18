import { IGanttWeekendsComponents } from "./createGanttWeekendsModule";
import { GanttWeekendToggle } from "./components";

/** The defaults for {@link IGanttWeekendsComponents}. */
export const GanttWeekendsComponents: IGanttWeekendsComponents = {
    onRenderToggle: () => <GanttWeekendToggle />,
};
