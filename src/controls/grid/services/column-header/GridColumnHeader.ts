import { ColDef, Column } from "@ag-grid-community/core";
import { EventEmitter, IColumn, IRecord } from "@talxis/client-libraries";
import { IContextualMenuItem } from "@fluentui/react";
import { IAlignment } from "@utils";
import { IGridServiceLocator } from "../../services";
import { IGridColumnSettings } from "../columns";
import { GridColumnHeaderTheme } from "./GridColumnHeaderTheme";
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
export class GridColumnHeader extends EventEmitter<IGridColumnHeaderEvents> {
    private _services: IGridServiceLocator;
    private _column: Column;
    private _element?: HTMLElement;
    private _theme: GridColumnHeaderTheme;

    constructor(parameters: IGridColumnHeaderParameters) {
        super();
        this._services = parameters.services;
        this._column = parameters.column;
        this._element = parameters.element;
        this._theme = new GridColumnHeaderTheme({ services: parameters.services, header: this });
    }

    /** What this header is drawn in. */
    public getTheme(): GridColumnHeaderTheme {
        return this._theme;
    }

    /** Asks for the menu, which is what draws it. */
    public openMenu(): void {
        this.dispatchEvent('onMenuVisibilityChanged', true);
    }

    /** Asks for it to go away again. */
    public closeMenu(): void {
        this.dispatchEvent('onMenuVisibilityChanged', false);
    }

    public getColDef(): ColDef<IRecord> {
        return this._column.getColDef();
    }

    /** The column the provider has for this one, where it has one: a column of the grid's own has none. */
    public getColumn(): IColumn | undefined {
        return this._services.get('provider').getColumnsMap()[this.getColDef().colId!];
    }

    /** What the column says its cells and its header are. */
    public getSettings(): IGridColumnSettings {
        return this.getColDef().settings ?? {};
    }

    /** Which edge the column reads from. */
    public getAlignment(): IAlignment {
        return this.getSettings().alignment ?? 'left';
    }

    /** Whether the column asks for a value. */
    public isRequired(): boolean {
        return !!this.getSettings().isRequired;
    }

    /** Whether what the column holds may be changed. */
    public isEditable(): boolean {
        return this.getSettings().isEditable !== false;
    }

    public getName(): string {
        return this.getColDef().headerName ?? '';
    }

    /** What the header's tooltip says: the name, and what the adornments add to it in parentheses. */
    public getTitle(): string {
        const titles = this.getAdornments().map(adornment => adornment.title).filter(Boolean);
        return titles.length ? `${this.getName()} (${titles.join(', ')})` : this.getName();
    }

    /** What the modules draw beside the name, all of them or those of one placement. */
    public getAdornments(placement?: IColumnHeaderAdornment['placement']): IColumnHeaderAdornment[] {
        const adornments = this._headers.getAdornments(this);
        return placement ? adornments.filter(adornment => adornment.placement === placement) : adornments;
    }

    /** Everything the modules offer for this column. */
    public getMenuItems(): IContextualMenuItem[] {
        return this._headers.getMenuItems(this);
    }

    /** The element AG Grid draws the header in, which is what takes the focus and hears the keys. */
    public getElement(): HTMLElement | undefined {
        return this._element;
    }


    private get _headers() {
        return this._services.get('columnHeaders');
    }
}
