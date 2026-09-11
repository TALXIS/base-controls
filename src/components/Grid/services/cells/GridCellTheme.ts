import { ITheme, Theming } from "@legacy";
import { IColumn, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { IGridCellThemeResult } from "./GridCells";

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
        const result: IGridCellThemeResult = { theme: this._getDefaultTheme() };
        this._cells.applyCellThemeHooks(result, { record: this._record, columnName: this._columnName });
        return result.theme;
    }

    public isCustom(): boolean {
        return this.getValue().id !== this._gridTheme.id;
    }

    /**
     * Legacy: taking the theme off the record's own formatting is how cells were coloured before hooks
     * existed. Register a cell theme hook instead - this goes when nothing needs it.
     */
    private _getDefaultTheme(): ITheme {
        const gridTheme = this._gridTheme;
        if (!this._column) {
            return gridTheme;
        }
        const formatting = this._record.getColumnInfo(this._columnName).ui.getCustomFormatting(gridTheme) ?? {};
        const id = (formatting as ITheme).id;
        if (!id) {
            if (Object.keys(formatting).length > 0) {
                console.warn(`[Grid] The custom formatting on column ${this._columnName} carries no id, so it is ignored. A formatting has to name itself for its theme to be built and cached.`);
            }
            return gridTheme;
        }
        const backgroundColor = formatting.backgroundColor ?? gridTheme.semanticColors.bodyBackground;
        const isRecoloured = backgroundColor !== gridTheme.semanticColors.bodyBackground;
        const contrast = Theming.GetTextColorForBackground(backgroundColor);
        return Theming.GenerateThemeV8(
            formatting.primaryColor ?? (isRecoloured ? contrast : gridTheme.palette.themePrimary),
            backgroundColor,
            formatting.textColor || (isRecoloured ? contrast : gridTheme.semanticColors.bodyText),
            { id: id });
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
