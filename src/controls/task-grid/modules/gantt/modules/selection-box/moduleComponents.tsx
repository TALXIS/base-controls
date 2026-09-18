import { IGanttSelectionBoxComponents } from "./createGanttSelectionBoxModule";
import { GanttSelectionBoxLayer } from "./selection-box-layer";

/** The defaults for {@link IGanttSelectionBoxComponents}. */
export const GanttSelectionBoxComponents: IGanttSelectionBoxComponents = {
    onRenderSelectionBoxLayer: () => <GanttSelectionBoxLayer />,
};
