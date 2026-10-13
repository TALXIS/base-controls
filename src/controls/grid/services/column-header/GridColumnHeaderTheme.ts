import { ITheme, ThemeBuilder } from "@theme";
import { IGridInternalServiceLocator } from "../../services";
import { IGridColumnHeader } from "./GridColumnHeader";

export interface IGridColumnHeaderThemeParameters {
    services: IGridInternalServiceLocator;
    /** The header this is the theme of. */
    header: IGridColumnHeader;
}

/** The theme a column header and everything drawn in it takes. */
export interface IGridColumnHeaderTheme {
    /** Sets the theme the header's theme is worked out from in place of the grid's. */
    setSeed(seed: ITheme | undefined): void;
    get(): ITheme;
}

export class GridColumnHeaderTheme implements IGridColumnHeaderTheme {
    private _services: IGridInternalServiceLocator;
    private _header: IGridColumnHeader;
    private _seed?: ITheme;

    constructor(parameters: IGridColumnHeaderThemeParameters) {
        this._services = parameters.services;
        this._header = parameters.header;
    }

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
        return this._services.get('columns').headers;
    }
}
