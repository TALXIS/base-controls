import { IGanttTaskCreateComponents } from "./createGanttTaskCreateModule";
import { GanttTaskCreateLayer } from "./create-layer";

/** The defaults for {@link IGanttTaskCreateComponents}. */
export const GanttTaskCreateComponents: IGanttTaskCreateComponents = {
    onRenderCreateLayer: () => <GanttTaskCreateLayer />,
};
