import type { IStyle, ITheme } from "@fluentui/react";
import { EventEmitter } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber } from "@core";

/** What the chart is styled with, on top of the Gantt's own styles. */
export interface IGanttStyles {
    styles: IStyle[];
}

/** A hook over the styles of the chart, handed the Fluent theme the Gantt mounted with. */
export type GanttStylesHook = (result: IGanttStyles, fluentTheme: ITheme) => void;

/** The styles the Gantt's chart is drawn with. */
export interface IGanttTheme {
    /**
     * Adds a hook over the styles of the chart, read once its modules are loaded.
     * @param priority Ascending: a higher number runs later.
     */
    addStylesHook(hook: GanttStylesHook, priority?: number): () => void;
}

export interface IGanttThemeEvents {
    onStylesChanged: () => void;
}

/** What the Gantt's own parts read of it. */
export interface IGanttThemeInternal extends IGanttTheme {
    readonly events: IEventSubscriber<IGanttThemeEvents>;
    /** Changes whenever a style hook is added or removed. */
    getVersion(): number;
    /** What the style hooks add to the Gantt's own styles. */
    getStyles(fluentTheme: ITheme): IStyle[];
}

export class GanttTheme implements IGanttThemeInternal {
    public readonly events = new EventEmitter<IGanttThemeEvents>();
    private _stylesHooks = new HookRegistry<GanttStylesHook>();
    private _version = 0;

    public addStylesHook(hook: GanttStylesHook, priority?: number): () => void {
        const unregister = this._stylesHooks.add(hook, priority);
        this._onStylesChanged();
        return () => {
            unregister();
            this._onStylesChanged();
        };
    }

    public getVersion(): number {
        return this._version;
    }

    public getStyles(fluentTheme: ITheme): IStyle[] {
        const result: IGanttStyles = { styles: [] };
        this._stylesHooks.apply(result, fluentTheme);
        return result.styles;
    }

    private _onStylesChanged(): void {
        this._version++;
        this.events.dispatchEvent('onStylesChanged');
    }
}
