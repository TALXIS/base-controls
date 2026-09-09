import { ITheme, Theming } from "@legacy";
import { IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";

export interface IGridThemingParameters {
    /** The control's theme, which every cell takes unless its column or a hook says otherwise. */
    theme: ITheme;
}

/** A cell's theme, and whether it differs from the grid's own. */
export interface IGridCellTheme {
    theme: ITheme;
    isCustom: boolean;
}

/**
 * Overrides the theme a cell is drawn in. Replace `result.theme` to give the cell another.
 *
 * Return one from `Theming.GenerateThemeV8`: whether a cell counts as custom is decided by the theme's id,
 * and a theme built any other way carries none.
 */
export type GridCellThemeHook = (result: { theme: ITheme }, params: { record: IRecord; columnName: string }) => void;

/** Which theme a cell is drawn in. */
export class GridTheming {
    private _theme: ITheme;
    private _hooks = new HookRegistry<GridCellThemeHook>();

    constructor(parameters: IGridThemingParameters) {
        this._theme = parameters.theme;
    }

    /** The grid's own theme, which is what a cell gets unless something asks for another. */
    public getTheme(): ITheme {
        return this._theme;
    }

    /**
     * Registers a hook over the theme a cell is drawn in. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellThemeHook(hook: GridCellThemeHook, priority?: number): void {
        this._hooks.register(hook, priority);
    }

    /** What theme this cell needs, and whether that is one of its own. */
    public getCellTheme(record: IRecord, columnName: string): IGridCellTheme {
        const result = { theme: this._getDefaultTheme(record, columnName) };
        this._hooks.apply(result, { record: record, columnName: columnName });
        return { theme: result.theme, isCustom: !this._isGridTheme(result.theme) };
    }

    /**
     * The background this cell paints, where a hook or its column gave it a theme of its own.
     *
     * `undefined` for a cell drawn in the grid's own theme: the row already carries that background, and a
     * cell painting one of its own covers what AG Grid drew on the one behind it - the range, the value
     * flash, the row's selection.
     */
    public getCellBackgroundColor(record: IRecord, columnName: string): string | undefined {
        const { theme, isCustom } = this.getCellTheme(record, columnName);
        return isCustom ? theme.semanticColors.bodyBackground : undefined;
    }

    /**
     * The theme a cell takes before any hook: the grid's own, or one built from what its column asked for.
     *
     * Legacy, kept for back compat: `getCustomFormatting` is how a host coloured cells by value before
     * hooks existed, and a hook is the way to do it now. This goes when nothing needs it.
     */
    private _getDefaultTheme(record: IRecord, columnName: string): ITheme {
        const formatting = record.getColumnInfo(columnName).ui.getCustomFormatting(this._theme) ?? {};
        //carried at runtime but absent from `ICustomColumnFormatting`. A formatting that means something
        //names itself, and `GenerateThemeV8` takes the id as a promise that the same one means the same
        //theme - so it is both what identifies a custom theme and what it is cached on
        const id = (formatting as ITheme).id;
        if (!id) {
            return this._theme;
        }
        const backgroundColor = formatting.backgroundColor ?? this._theme.semanticColors.bodyBackground;
        const isRecoloured = backgroundColor !== this._theme.semanticColors.bodyBackground;
        //a background of its own is taken as emphasis: the text goes to whatever reads on it, and so does
        //the primary colour unless the column named one itself
        const contrast = Theming.GetTextColorForBackground(backgroundColor);
        return Theming.GenerateThemeV8(
            formatting.primaryColor ?? (isRecoloured ? contrast : this._theme.palette.themePrimary),
            backgroundColor,
            formatting.textColor || (isRecoloured ? contrast : this._theme.semanticColors.bodyText),
            { id: id });
    }

    /** Whether a theme is the grid's own. */
    private _isGridTheme(theme: ITheme): boolean {
        return theme.id === this._theme.id;
    }
}
