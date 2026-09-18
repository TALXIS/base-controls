import { useSelectionBox } from "../hooks/useSelectionBox";

/**
 * Where the selection band lives.
 *
 * It renders nothing of its own — `Selecto` builds and owns the band's element. A component rather than a
 * hook call in the timeline, so the Gantt core renders this module without knowing what is in it.
 */
export const GanttSelectionBoxLayer = () => {
    useSelectionBox();
    return null;
};
