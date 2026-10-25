import type { IGanttModule } from "../../interfaces";
import { GanttLinks, IGanttLinksParameters } from "./GanttLinks";

export interface IGanttLinksModule extends IGanttModule<'links'> { }

/** Draws the `dependencies` module's dependencies; does nothing without that module. */
export const createGanttLinksModule = (parameters: IGanttLinksParameters = {}): IGanttLinksModule => ({
    name: 'links',
    onLoad: gantt => new GanttLinks(gantt, parameters),
    onDestroy: links => links.destroy(),
});
