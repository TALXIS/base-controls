import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { HookRegistry } from "@utils";
import { IGridColumn } from "../columns/interfaces";
import { IGridServiceLocator } from "../../services";

/**
 * A hook over what a column's menu offers.
 *
 * Mutates rather than returning, like the other hooks: a module pushes a section of its own onto the
 * array. Sections rather than loose entries, so no module has to know whether anything ran before it, and
 * none can leave a heading over somebody else's items.
 */
export type GridColumnMenuSectionsHook = (sections: IGridColumnMenuSection[], column: IGridColumn) => void;

/**
 * A hook over the menu the sections became.
 *
 * The way out for a module whose contribution is not a section — something above every heading, or a
 * change to what another module put there. Runs after the sections have been laid out, on the entries the
 * menu is about to be given.
 */
export type GridColumnMenuItemsHook = (items: IContextualMenuItem[], column: IGridColumn) => void;

/**
 * Something a module draws in a column header beside its name.
 *
 * A sort direction, a filter, a grouping, a total: each belongs to the module that knows about it, and
 * core only knows where they sit and in what order.
 */
export interface IGridColumnHeaderAdornment {
    key: string;
    /** Before the name, or after it. */
    placement: 'prefix' | 'suffix';
    /** Named in the header's tooltip, in parentheses, when the adornment is worth naming there. */
    title?: string;
    /** What it draws, where it draws anything: an adornment may only name the column. */
    onRender?: () => JSX.Element;
}

/** A hook over what a column header draws. Mutates the array it is handed. */
export type GridColumnHeaderAdornmentsHook = (adornments: IGridColumnHeaderAdornment[], column: IGridColumn) => void;

/** What a module contributes to a column's menu, under a heading of its own. */
export interface IGridColumnMenuSection {
    key: string;
    /** What the section is called, which is what tells the reader whose entries these are. */
    title: string;
    items: IContextualMenuItem[];
}

export interface IGridColumnHeaderPartsParameters {
    services: IGridServiceLocator;
}

/**
 * What a column header offers, and what it draws.
 *
 * The grid contributes neither: sorting, filtering, grouping and totals are all modules, so a header with
 * none of them registered shows a name, draws nothing, and opens no menu.
 */
export class GridColumnHeaderParts {
    private _services: IGridServiceLocator;
    private _menuSectionHooks = new HookRegistry<GridColumnMenuSectionsHook>();
    private _menuItemHooks = new HookRegistry<GridColumnMenuItemsHook>();
    private _adornmentHooks = new HookRegistry<GridColumnHeaderAdornmentsHook>();

    constructor(parameters: IGridColumnHeaderPartsParameters) {
        this._services = parameters.services;
    }

    /**
     * Registers a hook over what a column's menu offers.
     *
     * @param priority Ascending, so a module can place its section against the others: sorting at `0`,
     * filtering at `10`, grouping at `20`, totals at `30`.
     */
    public registerColumnMenuSectionHook(hook: GridColumnMenuSectionsHook, priority?: number): void {
        this._menuSectionHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the assembled menu, for a contribution a section cannot express.
     *
     * Runs after every section has been laid out, so this is where a module reaches an entry that is not
     * its own. Prefer {@link registerColumnMenuSectionHook}: a section is what keeps a menu assembled
     * from several modules readable.
     *
     * @param priority Ascending, and applied after all the sections regardless.
     */
    public registerColumnMenuItemsHook(hook: GridColumnMenuItemsHook, priority?: number): void {
        this._menuItemHooks.register(hook, priority);
    }

    /**
     * Everything the modules offer for a column, in order. Empty means no menu.
     *
     * Each section becomes a heading and the entries under it. A module that offered nothing for this
     * column contributes no heading either.
     */
    public getMenuItems(column: IGridColumn): IContextualMenuItem[] {
        const sections: IGridColumnMenuSection[] = [];
        this._menuSectionHooks.apply(sections, column);
        const items = sections
            .filter(section => section.items.length > 0)
            .flatMap(section => [{
                key: `${section.key}Header`,
                itemType: ContextualMenuItemType.Header,
                text: section.title,
                //a heading names the entries under it rather than being one, so it does not sit in the
                //icon column they line up against
                onRenderIcon: () => null,
            }, ...section.items]);
        this._menuItemHooks.apply(items, column);
        return items;
    }

    /** Registers a hook over what a column header draws beside its name. */
    public registerColumnHeaderAdornmentsHook(hook: GridColumnHeaderAdornmentsHook, priority?: number): void {
        this._adornmentHooks.register(hook, priority);
    }

    /** Everything the modules draw for a column, in order. */
    public getAdornments(column: IGridColumn): IGridColumnHeaderAdornment[] {
        const adornments: IGridColumnHeaderAdornment[] = [];
        this._adornmentHooks.apply(adornments, column);
        return adornments;
    }
}

