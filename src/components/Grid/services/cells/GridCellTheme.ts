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
            if (!result.theme.id) {
                throw new Error(`[Grid] The theme a hook gave the ${this._columnName} cell carries no id. An id is what the grid caches the theme on and what tells it apart from the grid's own, so a theme without one cannot be used.`);
            }
            return result.theme;
        }
        const { primary, background, text } = result.colors;
        //the grid's own three colours generate the grid's own theme - the generator is keyed on them, so
        //an untouched cell gets that instance back rather than a copy of it
        return Theming.GenerateThemeV8(primary, background, text);
    }

    /** Whether this is a theme of the cell's own rather than the one the whole grid is drawn in. */
    public isCustom(): boolean {
        return this.getValue().id !== this._gridTheme.id;
    }

    /**
     * What the cell is drawn in before any hook: the grid's colours, or the ones its column asked for.
     *
     * Legacy: `getCustomFormatting` is how a host coloured cells by value before hooks existed, and a hook
     * is the way to do it now. This goes when nothing needs it.
     */
    private _getDefaultColors(): IGridCellThemeColors {
        const gridColors = this._gridColors;
        if (!this._column) {
            return gridColors;
        }
        const formatting = this._record.getColumnInfo(this._columnName).ui.getCustomFormatting(this._gridTheme) ?? {};
        const background = formatting.backgroundColor ?? gridColors.background;
        const isRecoloured = background !== gridColors.background;
        //a background of its own is taken as emphasis: the text goes to whatever reads on it, and so does
        //the primary colour unless the column named one itself
        const contrast = Theming.GetTextColorForBackground(background);
        return {
            primary: formatting.primaryColor ?? (isRecoloured ? contrast : gridColors.primary),
            background: background,
            text: formatting.textColor || (isRecoloured ? contrast : gridColors.text),
        };
    }

    private get _gridColors(): IGridCellThemeColors {
        const gridTheme = this._gridTheme;
        return {
            primary: gridTheme.palette.themePrimary,
            background: gridTheme.semanticColors.bodyBackground,
            text: gridTheme.semanticColors.bodyText,
        };
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
