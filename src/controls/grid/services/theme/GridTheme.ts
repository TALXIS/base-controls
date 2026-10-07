import { FontWeights, IStyle } from "@fluentui/react";
import { createPart, Theme, themeQuartz } from "ag-grid-community";
import type { ITheme } from "@theme";
import { HookRegistry } from "@utils";

const FLUENT_PART = createPart({
    css: [
        //AG Grid pads the drag image with the cell padding the grid zeroes
        '.ag-dnd-ghost { --ag-cell-horizontal-padding: 10px; }',
        //square, like the focus border of a cell that is not being edited
        '.ag-cell.ag-cell-inline-editing { border-radius: 0; }',
    ].join(''),
});

/** The AG Grid theme a hook edits; replace it, since AG Grid's themes are immutable. */
export interface IGridAgTheme {
    theme: Theme;
}

/** A hook over the AG Grid theme, handed the Fluent theme the grid mounted with. */
export type GridThemeHook = (result: IGridAgTheme, fluentTheme: ITheme) => void;

/** What the grid's root element is styled with, on top of the grid's own styles. */
export interface IGridStyles {
    styles: IStyle[];
}

/** A hook over the styles of the grid's root element, handed the Fluent theme the grid mounted with. */
export type GridStylesHook = (result: IGridStyles, fluentTheme: ITheme) => void;

export interface IGridThemeParameters {
    /** The Fluent theme the grid mounted with. */
    theme: ITheme;
    rowHeight: number;
}

/** The AG Grid theme the grid is drawn in, made from its Fluent theme. */
export interface IGridTheme {
    /**
     * Registers a hook over the AG Grid theme, read once when the grid is created.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerTheme(hook: GridThemeHook, priority?: number): () => void;
    /** The AG Grid theme, after the hooks. */
    getAgTheme(): Theme;
    /**
     * Registers a hook over the styles of the grid's root element.
     *
     * @param priority Ascending: a later style wins where the selectors are equally specific.
     */
    registerStyles(hook: GridStylesHook, priority?: number): () => void;
    /** What the style hooks add to the grid's own styles. */
    getStyles(): IStyle[];
}

export class GridTheme implements IGridTheme {
    private _parameters: IGridThemeParameters;
    private _hooks = new HookRegistry<GridThemeHook>();
    private _stylesHooks = new HookRegistry<GridStylesHook>();
    private _agTheme?: Theme;

    constructor(parameters: IGridThemeParameters) {
        this._parameters = parameters;
    }

    public registerTheme(hook: GridThemeHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    public getAgTheme(): Theme {
        this._agTheme ??= this._buildAgTheme();
        return this._agTheme;
    }

    public registerStyles(hook: GridStylesHook, priority?: number): () => void {
        return this._stylesHooks.register(hook, priority);
    }

    public getStyles(): IStyle[] {
        const result: IGridStyles = { styles: [] };
        this._stylesHooks.apply(result, this._parameters.theme);
        return result.styles;
    }

    private _buildAgTheme(): Theme {
        const { theme } = this._parameters;
        const result: IGridAgTheme = { theme: themeQuartz.withParams(this._getFluentParams()).withPart(FLUENT_PART) };
        this._hooks.apply(result, theme);
        return result.theme;
    }

    /** AG Grid's theme parameters, read off the Fluent theme so the grid draws as a Fluent list. */
    private _getFluentParams(): Parameters<typeof themeQuartz.withParams>[0] {
        const { theme, rowHeight } = this._parameters;
        const { palette, semanticColors, fonts, effects } = theme;
        const divider = { color: semanticColors.bodyDivider };
        return {
            accentColor: palette.themePrimary,
            backgroundColor: semanticColors.bodyBackground,
            foregroundColor: semanticColors.bodyText,
            textColor: semanticColors.bodyText,
            borderColor: semanticColors.bodyDivider,
            browserColorScheme: theme.isInverted ? 'dark' : 'light',
            fontFamily: fonts.medium.fontFamily,
            fontSize: fonts.medium.fontSize,
            headerBackgroundColor: semanticColors.bodyBackground,
            headerTextColor: semanticColors.bodyText,
            headerFontWeight: FontWeights.semibold,
            rowHeight: rowHeight,
            headerHeight: rowHeight,
            //the cells draw Fluent controls with their own padding
            cellHorizontalPadding: 0,
            borderRadius: effects.roundedCorner2,
            wrapperBorderRadius: 0,
            popupShadow: effects.elevation16,
            wrapperBorder: false,
            columnBorder: false,
            headerColumnBorder: false,
            pinnedColumnBorder: false,
            rowBorder: divider,
            headerRowBorder: divider,
            //translucent: AG Grid's row states are drawn over the cells
            rowHoverColor: `color-mix(in srgb, ${semanticColors.bodyText} 5%, transparent)`,
            selectedRowBackgroundColor: `color-mix(in srgb, ${palette.themePrimary} 20%, transparent)`,
            rangeSelectionBorderColor: palette.themePrimary,
            rangeSelectionBackgroundColor: `color-mix(in srgb, ${palette.themePrimary} 15%, transparent)`,
            //the flash on pasted cells
            valueChangeValueHighlightBackgroundColor: `color-mix(in srgb, ${palette.themePrimary} 45%, transparent)`,
            //the control in the cell is the editor
            cellEditingShadow: false,
        };
    }
}
