import { ITheme, ThemeBuilder } from "@theme";
import { IGridServiceLocator } from "../../services";
import { GridColumnHeader } from "./GridColumnHeader";

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

    public get(): ITheme {
        const builder = ThemeBuilder.from({ theme: this._seed ?? this._gridTheme });
        this._headers.applyColumnHeaderThemeHooks(builder, this._header);
        return builder.getTheme();
    }

    private get _gridTheme(): ITheme {
        return this._services.get('theme');
    }

    private get _headers() {
        return this._services.get('columnHeaders');
    }
}
