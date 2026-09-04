import { ITheme, Theming } from "@legacy";
import { ICustomColumnFormatting, IRecord } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { IGridServiceLocator } from "../../services";

export interface IGridThemingParameters {
    services: IGridServiceLocator;
    /** The control's theme. It does not change while a grid is alive. */
    theme: ITheme;
}

/**
 * Where a theme comes from.
 *
 * The control's own is derived in React, where `useControlTheme` lives, and handed over. What is derived
 * here is the per-row and per-column variants of it — which a row asks for on every render, so they are
 * worked out once and kept rather than rebuilt per cell.
 */
export class GridTheming {
    private _services: IGridServiceLocator;
    private _theme: ITheme;
    private _oddRowCellTheme: ITheme;
    private _evenRowCellTheme: ITheme;

    constructor(parameters: IGridThemingParameters) {
        this._services = parameters.services;
        this._theme = parameters.theme;
        this._oddRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.neutralLighterAlt, this._theme.semanticColors.bodyText);
        this._evenRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.white, this._theme.semanticColors.bodyText);
    }

    /** The control's theme, as the component derived it. */
    public getControlTheme(): ITheme {
        return this._theme;
    }

    /** A row's theme: the zebra variant, and the one a summarized or nested row takes instead. */
    public getCellTheme(record: IRecord): ITheme {
        const summarizationType = record.getDataProvider().getSummarizationType();
        if (summarizationType !== 'none') {
            return this._oddRowCellTheme;
        }
        //child of a group record
        if (record.getDataProvider().getParentDataProvider()) {
            return this._evenRowCellTheme;
        }
        if (record.getIndex() % 2 === 0 || !this._services.get('settings').isZebraEnabled()) {
            return this._evenRowCellTheme;
        }
        return this._oddRowCellTheme;
    }

    /**
     * What a column's formatting asks for, over the row's theme.
     *
     * A background of its own is taken as emphasis: the text goes to whatever reads on it and the medium
     * font gains weight, unless the column named a primary colour itself.
     */
    public getColumnFormatting(record: IRecord, columnName: string): Required<ICustomColumnFormatting> {
        const defaultTheme = this.getCellTheme(record);
        const defaultBackgroundColor = defaultTheme.semanticColors.bodyBackground;
        const customFormatting = record.getColumnInfo(columnName).ui.getCustomFormatting(defaultTheme) ?? {};
        const result: Required<ICustomColumnFormatting> = {
            backgroundColor: customFormatting.backgroundColor ?? defaultBackgroundColor,
            primaryColor: customFormatting.primaryColor ?? this._theme.palette.themePrimary,
            textColor: customFormatting.textColor ?? '',
            className: customFormatting.className ?? '',
            themeOverride: customFormatting.themeOverride ?? {}
        };
        if (result.backgroundColor !== defaultBackgroundColor) {
            result.themeOverride = merge({}, { fonts: { medium: { fontWeight: 600 } } }, result.themeOverride);
            if (!customFormatting.primaryColor) {
                result.primaryColor = Theming.GetTextColorForBackground(result.backgroundColor);
            }
        }
        if (!result.textColor) {
            result.textColor = Theming.GetTextColorForBackground(result.backgroundColor);
        }
        return result;
    }

    /** What a column with no record of its own shows: the checkbox column, and anything like it. */
    public getPlainFormatting(record: IRecord): Required<ICustomColumnFormatting> {
        const backgroundColor = this.getCellTheme(record).semanticColors.bodyBackground;
        return {
            primaryColor: this._theme.palette.themePrimary,
            backgroundColor: backgroundColor,
            textColor: Theming.GetTextColorForBackground(backgroundColor),
            className: '',
            themeOverride: {}
        };
    }
}
