import { ColDef, Column } from "@ag-grid-community/core";
import { EventEmitter, IEventEmitter, IColumn, IRecord } from "@talxis/client-libraries";
import { IContextualMenuItem } from "@fluentui/react";
import { IAlignment } from "@utils";
import { IGridServiceLocator } from "../../services";
import { IGridColumnSettings } from "../columns";
import { GridColumnHeaderTheme, IGridColumnHeaderTheme } from "./GridColumnHeaderTheme";
import { IColumnHeaderAdornment } from "./GridColumnHeaders";

export interface IGridColumnHeaderEvents {
    /** Whether the header's menu is to be drawn. */
    onMenuVisibilityChanged: (isOpen: boolean) => void;
}

export interface IGridColumnHeaderParameters {
    services: IGridServiceLocator;
    /** The column AG Grid is drawing, which is what its definition is read from. */
    column: Column;
    /** The element AG Grid draws the header in. */
    element?: HTMLElement;
}

/** The column a header is drawn for: what it says about itself, and what the modules add to it. */
export interface IGridColumnHeader extends IEventEmitter<IGridColumnHeaderEvents> {
    /** What this header is drawn in. */
    getTheme(): IGridColumnHeaderTheme;
    /** Asks for the menu, which is what draws it. */
    openMenu(): void;
    /** Asks for it to go away again. */
    closeMenu(): void;
    getColDef(): ColDef<IRecord>;
    /** The column the provider has for this one, where it has one: a column of the grid's own has none. */
    getColumn(): IColumn | undefined;
    /** What the column says its cells and its header are. */
    getSettings(): IGridColumnSettings;
    /** Which edge the column reads from. */
    getAlignment(): IAlignment;
    /** Whether the column asks for a value. */
    isRequired(): boolean;
    /** Whether what the column holds may be changed. */
    isEditable(): boolean;
    getName(): string;
    /** What the header's tooltip says: the name, and what the adornments add to it in parentheses. */
    getTitle(): string;
    /** What the modules draw beside the name, all of them or those of one placement. */
    getAdornments(placement?: IColumnHeaderAdornment['placement']): IColumnHeaderAdornment[];
    /** Everything the modules offer for this column. */
    getMenuItems(): IContextualMenuItem[];
    /** The element AG Grid draws the header in, which is what takes the focus and hears the keys. */
    getElement(): HTMLElement | undefined;
}

export class GridColumnHeader extends EventEmitter<IGridColumnHeaderEvents> implements IGridColumnHeader {
    private _services: IGridServiceLocator;
    private _column: Column;
    private _element?: HTMLElement;
    private _theme: IGridColumnHeaderTheme;

    constructor(parameters: IGridColumnHeaderParameters) {
        super();
        this._services = parameters.services;
        this._column = parameters.column;
        this._element = parameters.element;
        this._theme = new GridColumnHeaderTheme({ services: parameters.services, header: this });
    }

    public getTheme(): IGridColumnHeaderTheme {
        return this._theme;
    }

    public openMenu(): void {
        this.dispatchEvent('onMenuVisibilityChanged', true);
    }

    public closeMenu(): void {
        this.dispatchEvent('onMenuVisibilityChanged', false);
    }

    public getColDef(): ColDef<IRecord> {
        return this._column.getColDef();
    }

    public getColumn(): IColumn | undefined {
        return this._services.get('provider').getColumnsMap()[this.getColDef().colId!];
    }

    public getSettings(): IGridColumnSettings {
        return this.getColDef().settings ?? {};
    }

    public getAlignment(): IAlignment {
        return this.getSettings().alignment ?? 'left';
    }

    public isRequired(): boolean {
        return !!this.getSettings().isRequired;
    }

    public isEditable(): boolean {
        return this.getSettings().isEditable !== false;
    }

    public getName(): string {
        return this.getColDef().headerName ?? '';
    }

    public getTitle(): string {
        const titles = this.getAdornments().map(adornment => adornment.title).filter(Boolean);
        return titles.length ? `${this.getName()} (${titles.join(', ')})` : this.getName();
    }

    public getAdornments(placement?: IColumnHeaderAdornment['placement']): IColumnHeaderAdornment[] {
        const adornments = this._headers.getAdornments(this);
        return placement ? adornments.filter(adornment => adornment.placement === placement) : adornments;
    }

    public getMenuItems(): IContextualMenuItem[] {
        return this._headers.getMenuItems(this);
    }

    public getElement(): HTMLElement | undefined {
        return this._element;
    }


    private get _headers() {
        return this._services.get('columns').headers;
    }
}
