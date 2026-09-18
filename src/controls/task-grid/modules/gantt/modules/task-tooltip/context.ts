import { useGanttServices } from "../../context";
import { IGanttTaskTooltipComponents } from "./createGanttTaskTooltipModule";

/** The module's components, as it resolved them. Only called where the module is registered. */
export const useGanttTaskTooltipComponents = (): IGanttTaskTooltipComponents => {
    return useGanttServices().get('taskTooltipModule').components;
};
