import type { IGanttModule } from "../../interfaces";
import { Links, ILinksParameters } from "./Links";

export interface ILinksModule extends IGanttModule<'links'> { }

/** Draws the `dependencies` module's dependencies, doing nothing without it. */
export const createLinksModule = (parameters: ILinksParameters = {}): ILinksModule => ({
    name: 'links',
    onLoad: gantt => new Links(gantt, parameters),
    onDestroy: links => links.destroy(),
});