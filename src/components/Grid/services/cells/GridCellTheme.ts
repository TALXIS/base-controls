import { ITheme, Theming } from "@legacy";
import { IRowNode } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { IGridCellThemeColors, IGridCellThemeResult } from "./GridCells";

export interface IGridCellThemeParameters {
    services: IGridServiceLocator;
    record: IRecord;
    columnName: string;
    node?: IRowNode<IRecord>;
}

/** The theme one cell is drawn in: the grid's own, unless its column or a hook asked for another. */
export class GridCellTheme {
    private _services: IGridServiceLocator;
    private _record: IRecord;
    private _columnName: string;
    private _node?: IRowNode<IRecord>;

    constructor(parameters: IGridCellThemeParameters) {
        this._services = parameters.services;
        this._record = parameters.record;
        this._columnName = parameters.columnName;
        this._node = parameters.node;
    }

    public getValue(): ITheme {
        const result: IGridCellThemeResult = { colors: this._rowColors };
        this._cells.applyCellThemeHooks(result, { record: this._record, columnName: this._columnName });
        if (result.theme) {
            return result.theme;
        }
        const { primary, background, text } = result.colors;
        //the generator is keyed on the three colours, so two cells asking for the same ones are handed the
        //same instance rather than a copy each
        return Theming.GenerateThemeV8(primary, background, text);
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
        return (this._node?.rowIndex ?? 0) % 2 === 0;
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _gridTheme(): ITheme {
        return this._services.get('theme');
    }

    private get _cells() {
        return this._services.get('cells');
    }
}
