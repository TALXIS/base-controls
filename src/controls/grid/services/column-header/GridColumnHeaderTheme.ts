import { ITheme, Theming } from "@theme";
import { IGridServiceLocator } from "../../services";
import { GridColumnHeader } from "./GridColumnHeader";
import { IGridColumnHeaderThemeColors, IGridColumnHeaderThemeResult } from "./GridColumnHeaders";

export interface IGridColumnHeaderThemeParameters {
    services: IGridServiceLocator;
    /** The header this is the theme of. */
    header: GridColumnHeader;
}

/** The theme a column header and everything drawn in it takes. */
export class GridColumnHeaderTheme {
    private _services: IGridServiceLocator;
    private _header: GridColumnHeader;
    private _seed?: ITheme;

    constructor(parameters: IGridColumnHeaderThemeParameters) {
        this._services = parameters.services;
        this._header = parameters.header;
    }

    /** What the header's theme is worked out from, where the grid's own is not what it should be. */
    public setSeed(seed: ITheme | undefined): void {
        this._seed = seed;
    }

    public getValue(): ITheme {
        const base = this._seed ?? this._gridTheme;
        const result: IGridColumnHeaderThemeResult = { colors: colorsOf(base) };
        this._headers.applyColumnHeaderThemeHooks(result, this._header);
        if (result.theme) {
            return result.theme;
        }
        const { primary, background, text } = result.colors;
        //nothing asked for anything else, so the header is drawn in what it started from
        if (primary === base.palette.themePrimary && background === base.semanticColors.bodyBackground && text === base.semanticColors.bodyText) {
            return base;
        }
        //the generator is keyed on the three colours
        return Theming.GenerateThemeV8(primary, background, text);
    }

    private get _gridTheme(): ITheme {
        return this._services.get('theme');
    }

    private get _headers() {
        return this._services.get('columnHeaders');
    }
}

/** The three colours a theme is generated from, as it holds them. */
const colorsOf = (theme: ITheme): IGridColumnHeaderThemeColors => ({
    primary: theme.palette.themePrimary,
    background: theme.semanticColors.bodyBackground,
    text: theme.semanticColors.bodyText,
});
