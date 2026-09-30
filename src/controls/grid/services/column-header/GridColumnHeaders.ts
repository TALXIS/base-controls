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
    /** Named in parentheses in the header's tooltip. */
    title?: string;
    /** What it draws, if anything. */
    onRender?: () => JSX.Element | null;
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

/** What a column header offers and what it draws. */
export interface IGridColumnHeaders {
    /** The header of one column, as the parts drawing it read it. */
    createHeader(parameters: {
        column: Column;
        element?: HTMLElement;
    }): IGridColumnHeader;
    /**
     * Registers a hook over what a column's menu offers, under a heading of its own.
     *
     * @param priority Ascending: the modules sit at {@link GRID_MODULE_PRIORITY}.
     */
    registerColumnMenuSectionHook(hook: GridColumnMenuSectionsHook, priority?: number): () => void;
    /**
     * Registers a hook over the assembled menu, for what a section cannot express.
     *
     * @param priority Ascending among hooks that all run after the sections.
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
     * @param priority Ascending: a higher number gets the later word.
     */
    registerColumnHeaderThemeHook(hook: GridColumnHeaderThemeHook, priority?: number): () => void;
    /** Run by the header in question. */
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
        header.getSettings().header?.onGetMenuSections?.(sections);
        const items = sections
            .filter(section => section.items.length > 0)
            .flatMap(section => [{
                key: `${section.key}Header`,
                itemType: ContextualMenuItemType.Header,
                text: section.title,
                //a heading names the entries under it
                onRenderIcon: () => null,
            }, ...section.items]);
        this._menuItemHooks.apply(items, header);
        header.getSettings().header?.onGetMenuItems?.(items);
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
        header.getSettings().header?.onGetTheme?.(theme);
    }

    public getAdornments(header: IGridColumnHeader): IColumnHeaderAdornment[] {
        const adornments: IColumnHeaderAdornment[] = [];
        this._adornmentHooks.apply(adornments, header);
        header.getSettings().header?.onGetAdornments?.(adornments);
        return adornments;
    }
}
