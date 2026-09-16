import { IColumn } from "@talxis/client-libraries";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";

/** A hook over what a column's menu offers. */
export type GridColumnMenuSectionsHook = (sections: IColumnMenuSection[], column: IColumn) => void;

/** A hook over the menu the sections became. */
export type GridColumnMenuItemsHook = (items: IContextualMenuItem[], column: IColumn) => void;

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

/** A hook over what a column header draws. */
export type GridColumnHeaderAdornmentsHook = (adornments: IColumnHeaderAdornment[], column: IColumn) => void;

/** What a module contributes to a column's menu, under a heading of its own. */
export interface IColumnMenuSection {
    key: string;
    /** What the section is called. */
    title: string;
    items: IContextualMenuItem[];
}

export interface IColumnHeaderPartsParameters {
    services: IGridServiceLocator;
}

/** What a column header offers, and what it draws. */
export class GridColumnHeaderParts {
    private _services: IGridServiceLocator;
    private _menuSectionHooks = new HookRegistry<GridColumnMenuSectionsHook>();
    private _menuItemHooks = new HookRegistry<GridColumnMenuItemsHook>();
    private _adornmentHooks = new HookRegistry<GridColumnHeaderAdornmentsHook>();

    constructor(parameters: IColumnHeaderPartsParameters) {
        this._services = parameters.services;
    }

    /**
     * Registers a hook over what a column's menu offers.
     *
     * @param priority Ascending: sorting at `0`,
     */
    public registerColumnMenuSectionHook(hook: GridColumnMenuSectionsHook, priority?: number): () => void {
        return this._menuSectionHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the assembled menu, for a contribution a section cannot express.
     *
     * its own. Prefer {@link registerColumnMenuSectionHook}
     * @param priority Ascending, and applied after all the sections regardless.
     */
    public registerColumnMenuItemsHook(hook: GridColumnMenuItemsHook, priority?: number): () => void {
        return this._menuItemHooks.register(hook, priority);
    }

    /** Everything the modules offer for a column, in order. */
    public getMenuItems(column: IColumn): IContextualMenuItem[] {
        const sections: IColumnMenuSection[] = [];
        this._menuSectionHooks.apply(sections, column);
        const items = sections
            .filter(section => section.items.length > 0)
            .flatMap(section => [{
                key: `${section.key}Header`,
                itemType: ContextualMenuItemType.Header,
                text: section.title,
                //a heading names the entries under it rather than being one
                onRenderIcon: () => null,
            }, ...section.items]);
        this._menuItemHooks.apply(items, column);
        return items;
    }

    /** Registers a hook over what a column header draws beside its name. */
    public registerColumnHeaderAdornmentsHook(hook: GridColumnHeaderAdornmentsHook, priority?: number): () => void {
        return this._adornmentHooks.register(hook, priority);
    }

    /** Everything the modules draw for a column, in order. */
    public getAdornments(column: IColumn): IColumnHeaderAdornment[] {
        const adornments: IColumnHeaderAdornment[] = [];
        this._adornmentHooks.apply(adornments, column);
        return adornments;
    }
}

