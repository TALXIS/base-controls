import { Column } from "@ag-grid-community/core";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";
import { GridColumnHeader, IGridColumnHeader } from "./GridColumnHeader";

/** Something a module draws in a column header beside its name. */
export interface IColumnHeaderAdornment {
    key: string;
    /** Before the name, or after it. */
    placement: 'prefix' | 'suffix';
    /** Named in the header's tooltip, in parentheses, when the adornment is worth naming there. */
    title?: string;
    /** What it draws, where it draws anything: an adornment may only name the column. */
    onRender?: () => JSX.Element;
}

/** What a module contributes to a column's menu, under a heading of its own. */
export interface IColumnMenuSection {
    key: string;
    /** What the section is called. */
    title: string;
    items: IContextualMenuItem[];
}

/** A hook over what a column's menu offers. */
export type GridColumnMenuSectionsHook = (sections: IColumnMenuSection[], header: IGridColumnHeader) => void;

/** A hook over the menu the sections became. */
export type GridColumnMenuItemsHook = (items: IContextualMenuItem[], header: IGridColumnHeader) => void;

/** A hook over the theme a column header is drawn in. */
export type GridColumnHeaderThemeHook = (theme: ThemeBuilder, header: IGridColumnHeader) => void;

/** A hook over what a column header draws. */
export type GridColumnHeaderAdornmentsHook = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader) => void;

export interface IGridColumnHeadersParameters {
    services: IGridServiceLocator;
}

/** What a column header offers, and what it draws. */
export interface IGridColumnHeaders {
    /** The header of one column, as the parts drawing it read it. */
    createHeader(parameters: {
        column: Column;
        element?: HTMLElement;
    }): IGridColumnHeader;
    /**
     * Registers a hook over what a column's menu offers, under a heading of its own.
     *
     * @param priority Ascending: sorting at `0`, and every module after it in the order it was given.
     */
    registerColumnMenuSectionHook(hook: GridColumnMenuSectionsHook, priority?: number): () => void;
    /**
     * Registers a hook over the assembled menu, for a contribution a section cannot express.
     *
     * Prefer {@link registerColumnMenuSectionHook}: an entry under a heading of its own is what a module
     * offers.
     *
     * @param priority Ascending, and applied after all the sections regardless.
     */
    registerColumnMenuItemsHook(hook: GridColumnMenuItemsHook, priority?: number): () => void;
    /** Everything the modules offer for a column, in order. */
    getMenuItems(header: IGridColumnHeader): IContextualMenuItem[];
    /**
     * Registers a hook over what a column header draws beside its name.
     *
     * @param priority Ascending: a lower number runs earlier.
     */
    registerColumnHeaderAdornmentsHook(hook: GridColumnHeaderAdornmentsHook, priority?: number): () => void;
    /**
     * Registers a hook over the theme a column header is drawn in.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerColumnHeaderThemeHook(hook: GridColumnHeaderThemeHook, priority?: number): () => void;
    /** Run by the header in question, which is the only caller. */
    applyColumnHeaderThemeHooks(theme: ThemeBuilder, header: IGridColumnHeader): void;
    /** Everything the modules draw for a column, in order. */
    getAdornments(header: IGridColumnHeader): IColumnHeaderAdornment[];
}

export class GridColumnHeaders implements IGridColumnHeaders {
    private _services: IGridServiceLocator;
    private _menuSectionHooks = new HookRegistry<GridColumnMenuSectionsHook>();
    private _menuItemHooks = new HookRegistry<GridColumnMenuItemsHook>();
    private _adornmentHooks = new HookRegistry<GridColumnHeaderAdornmentsHook>();
    private _themeHooks = new HookRegistry<GridColumnHeaderThemeHook>();

    constructor(parameters: IGridColumnHeadersParameters) {
        this._services = parameters.services;
    }

    public createHeader(parameters: { column: Column; element?: HTMLElement }): IGridColumnHeader {
        return new GridColumnHeader({ services: this._services, ...parameters });
    }

    public registerColumnMenuSectionHook(hook: GridColumnMenuSectionsHook, priority?: number): () => void {
        return this._menuSectionHooks.register(hook, priority);
    }

    public registerColumnMenuItemsHook(hook: GridColumnMenuItemsHook, priority?: number): () => void {
        return this._menuItemHooks.register(hook, priority);
    }

    public getMenuItems(header: IGridColumnHeader): IContextualMenuItem[] {
        const sections: IColumnMenuSection[] = [];
        this._menuSectionHooks.apply(sections, header);
        const items = sections
            .filter(section => section.items.length > 0)
            .flatMap(section => [{
                key: `${section.key}Header`,
                itemType: ContextualMenuItemType.Header,
                text: section.title,
                //a heading names the entries under it rather than being one
                onRenderIcon: () => null,
            }, ...section.items]);
        this._menuItemHooks.apply(items, header);
        return items;
    }

    public registerColumnHeaderAdornmentsHook(hook: GridColumnHeaderAdornmentsHook, priority?: number): () => void {
        return this._adornmentHooks.register(hook, priority);
    }

    public registerColumnHeaderThemeHook(hook: GridColumnHeaderThemeHook, priority?: number): () => void {
        return this._themeHooks.register(hook, priority);
    }

    public applyColumnHeaderThemeHooks(theme: ThemeBuilder, header: IGridColumnHeader): void {
        this._themeHooks.apply(theme, header);
    }

    public getAdornments(header: IGridColumnHeader): IColumnHeaderAdornment[] {
        const adornments: IColumnHeaderAdornment[] = [];
        this._adornmentHooks.apply(adornments, header);
        return adornments;
    }
}
