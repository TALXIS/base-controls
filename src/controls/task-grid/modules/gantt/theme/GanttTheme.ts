import type { IStyle, ITheme } from "@fluentui/react";
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { HookRegistry } from "@core";

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

export interface IGanttThemeEvents {
    onStylesChanged: () => void;
}

/** What the Gantt's own parts read of it. */
export interface IGanttThemeInternal extends IGanttTheme {
    readonly events: IEventEmitter<IGanttThemeEvents>;
    /** Changes whenever a style hook is registered or unregistered. */
    getVersion(): number;
    /** What the style hooks add to the Gantt's own styles. */
    getStyles(fluentTheme: ITheme): IStyle[];
}

export class GanttTheme implements IGanttThemeInternal {
    public readonly events = new EventEmitter<IGanttThemeEvents>();
    private _stylesHooks = new HookRegistry<GanttStylesHook>();
    private _version = 0;

    public registerStyles(hook: GanttStylesHook, priority?: number): () => void {
        const unregister = this._stylesHooks.register(hook, priority);
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
