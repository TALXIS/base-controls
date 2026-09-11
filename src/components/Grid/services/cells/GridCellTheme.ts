import { ITheme, Theming } from "@legacy";
import { IColumn, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { IGridCellThemeColors, IGridCellThemeResult } from "./GridCells";

export interface IGridCellThemeParameters {
    services: IGridServiceLocator;
    record: IRecord;
    columnName: string;
}

/** The theme one cell is drawn in: the grid's own, unless its column or a hook asked for another. */
export class GridCellTheme {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;

    constructor(parameters: IGridCellThemeParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._columnName = parameters.columnName;
    }

    public getValue(): ITheme {
        const result: IGridCellThemeResult = { colors: this._getDefaultColors() };
        this._cells.applyCellThemeHooks(result, { record: this._record, columnName: this._columnName });
        if (result.theme) {
            return result.theme;
        }
        const { primary, background, text } = result.colors;
        //the generator is keyed on the three colours, so two cells asking for the same ones are handed the
        //same instance rather than a copy each
        return Theming.GenerateThemeV8(primary, background, text);
    }

    /**
     * What the cell is drawn in before any hook: its row's colours, or the ones its column asked for.
     *
     * Legacy: `getCustomFormatting` is how a host coloured cells by value before hooks existed, and a hook
     * is the way to do it now. This goes when nothing needs it.
     */
    private _getDefaultColors(): IGridCellThemeColors {
        const rowColors = this._rowColors;
        if (!this._column) {
            return rowColors;
        }
        //the row's theme, not the grid's: a formatting that changes nothing hands back the theme it was
        //given, and handing it the grid's would paint every striped row in the grid's own surface
        const formatting = this._record.getColumnInfo(this._columnName).ui.getCustomFormatting(this._rowTheme) ?? {};
        const background = formatting.backgroundColor ?? rowColors.background;
        const isRecoloured = background !== rowColors.background;
        //a background of its own is taken as emphasis: the text goes to whatever reads on it, and so does
        //the primary colour unless the column named one itself
        const contrast = Theming.GetTextColorForBackground(background);
        return {
            primary: formatting.primaryColor ?? (isRecoloured ? contrast : rowColors.primary),
            background: background,
            text: formatting.textColor || (isRecoloured ? contrast : rowColors.text),
        };
    }

    /** The colours of the row this cell is in: the grid's, striped on every other row. */
    private get _rowColors(): IGridCellThemeColors {
        const gridTheme = this._gridTheme;
        return {
            primary: gridTheme.palette.themePrimary,
            background: this._rowBackground,
            text: gridTheme.semanticColors.bodyText,
        };
    }

    /** The row's colours as a theme, which is what a column's formatting is asked to work from. */
    private get _rowTheme(): ITheme {
        const { primary, background, text } = this._rowColors;
        return Theming.GenerateThemeV8(primary, background, text);
    }

    /** What the row this cell is in is drawn on: the grid's surface, or a step off it on every other row. */
    private get _rowBackground(): string {
        const gridTheme = this._gridTheme;
        if (!this._settings.isZebraEnabled() || this._isEvenRow) {
            return gridTheme.semanticColors.bodyBackground;
        }
        //the faintest step off the surface Fluent has, which is what the grid striped with before
        return gridTheme.palette.neutralLighterAlt;
    }

    private get _isEvenRow(): boolean {
        //a row AG Grid has not placed yet is drawn unstriped rather than guessed at
        return (this._services.get('rows').getIndex(this._record) ?? 0) % 2 === 0;
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _column(): IColumn | undefined {
        return this._record.getDataProvider().getColumnsMap()[this._columnName];
    }

    private get _gridTheme(): ITheme {
        return this._services.get('theme');
    }

    private get _cells() {
        return this._services.get('cells');
    }
}
