import type { IStyle, ITheme } from "@fluentui/react";
import { HookRegistry } from "@utils";

/** What the chart is styled with, on top of the Gantt's own styles. */
export interface IGanttStyles {
    styles: IStyle[];
}

/** A hook over the styles of the chart, handed the Fluent theme the Gantt mounted with. */
export type GanttStylesHook = (result: IGanttStyles, fluentTheme: ITheme) => void;

/** The styles the Gantt's chart is drawn with. */
export interface IGanttTheme {
    /**
     * Registers a hook over the styles of the chart, read once its modules are loaded.
     * @param priority Ascending: a later style wins where the selectors are equally specific.
     */
    registerStyles(hook: GanttStylesHook, priority?: number): () => void;
}

/** What the Gantt's own parts read of it. */
export interface IGanttThemeInternal extends IGanttTheme {
    /** What the style hooks add to the Gantt's own styles. */
    getStyles(fluentTheme: ITheme): IStyle[];
}

export class GanttTheme implements IGanttThemeInternal {
    private _stylesHooks = new HookRegistry<GanttStylesHook>();

    public registerStyles(hook: GanttStylesHook, priority?: number): () => void {
        return this._stylesHooks.register(hook, priority);
    }

    public getStyles(fluentTheme: ITheme): IStyle[] {
        const result: IGanttStyles = { styles: [] };
        this._stylesHooks.apply(result, fluentTheme);
        return result.styles;
    }
}
