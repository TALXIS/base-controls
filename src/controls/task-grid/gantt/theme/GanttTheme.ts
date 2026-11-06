import type { IStyle, ITheme } from "@fluentui/react";
import { EventEmitter } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";

/** What the chart is styled with, on top of the Gantt's own styles. */
export interface IGanttStyles {
    styles: IStyle[];
}

/** A hook over the styles of the chart, handed the Fluent theme the Gantt mounted with. */
export type GanttStylesHook = (result: IGanttStyles, fluentTheme: ITheme) => void;

export interface IGanttThemeHooks {
    /** The styles of the chart, read once its modules are loaded. */
    readonly styles: IHookPoint<GanttStylesHook>;
}

/** The styles the Gantt's chart is drawn with. */
export interface IGanttTheme {
    readonly hooks: IGanttThemeHooks;
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
    public readonly hooks = {
        styles: new HookRegistry<GanttStylesHook>({ onChange: () => this._onStylesChanged() }),
    };
    private _version = 0;

    public getVersion(): number {
        return this._version;
    }

    public getStyles(fluentTheme: ITheme): IStyle[] {
        const result: IGanttStyles = { styles: [] };
        this.hooks.styles.apply(result, fluentTheme);
        return result.styles;
    }

    private _onStylesChanged(): void {
        this._version++;
        this.events.dispatchEvent('onStylesChanged');
    }
}
