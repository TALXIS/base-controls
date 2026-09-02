import { useGanttServices } from "../../context";
import { IGanttWeekendsComponents } from "./createGanttWeekendsModule";

/** The weekends module's components, as it resolved them. Only called where the module is registered. */
export const useGanttWeekendsComponents = (): IGanttWeekendsComponents => {
    return useGanttServices().get('weekendsModule').components;
};

/** Resolves the module's own strings. */
export const useGanttWeekendsLabels = () => {
    return useGanttServices().get('weekendsLabels');
};
