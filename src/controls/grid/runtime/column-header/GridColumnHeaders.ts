import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { Column } from "ag-grid-community";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";
import { IGridServiceRegistryInternal } from "..";
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
export type GridColumnHeaderThemeHook = (builder: ThemeBuilder, header: IGridColumnHeader) => void;

/** A hook over what a column header draws. */
export type GridColumnHeaderAdornmentsHook = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader) => void;

export interface IGridColumnHeadersParameters {
    services: IGridServiceRegistryInternal;
}

/** What a column header offers and what it draws. */
export interface IGridColumnHeadersEvents {
    /** Every header on screen is to be drawn again. */
    onRenderRequested: () => void;
}

export interface IGridColumnHeadersHooks {
    /** What a column's menu offers, under a heading of its own. */
    readonly menuSections: IHookPoint<GridColumnMenuSectionsHook>;
    /** The assembled menu, for what a section cannot express. */
    readonly menuItems: IHookPoint<GridColumnMenuItemsHook>;
    /** What a column header draws beside its name. */
    readonly adornments: IHookPoint<GridColumnHeaderAdornmentsHook>;
    /** The theme a column header is drawn in. */
    readonly theme: IHookPoint<GridColumnHeaderThemeHook>;
}

export interface IGridColumnHeaders {
    /** Draws every header on screen again, for a change their columns do not carry. */
    render(): void;
    readonly hooks: IGridColumnHeadersHooks;
}

/** What the grid's own parts read of it. */
export interface IGridColumnHeadersInternal extends IGridColumnHeaders {
    /** The header of one column, as the parts drawing it read it. */
    createHeader(parameters: {
        column: Column;
        element?: HTMLElement;
    }): IGridColumnHeader;
    readonly events: IEventSubscriber<IGridColumnHeadersEvents>;
    /** Everything the modules offer for a column, in order. */
    getMenuItems(header: IGridColumnHeader): IContextualMenuItem[];
    /** Run by the header in question. */
    applyColumnHeaderThemeHooks(builder: ThemeBuilder, header: IGridColumnHeader): void;
    /** Everything the modules draw for a column, in order. */
    getAdornments(header: IGridColumnHeader): IColumnHeaderAdornment[];
}

export class GridColumnHeaders implements IGridColumnHeadersInternal {
    private _services: IGridServiceRegistryInternal;
    public readonly events: IEventEmitter<IGridColumnHeadersEvents> = new EventEmitter<IGridColumnHeadersEvents>();
    public readonly hooks = {
        menuSections: new HookRegistry<GridColumnMenuSectionsHook>(),
        menuItems: new HookRegistry<GridColumnMenuItemsHook>(),
        adornments: new HookRegistry<GridColumnHeaderAdornmentsHook>(),
        theme: new HookRegistry<GridColumnHeaderThemeHook>(),
    };

    constructor(parameters: IGridColumnHeadersParameters) {
        this._services = parameters.services;
    }

    public createHeader(parameters: { column: Column; element?: HTMLElement }): IGridColumnHeader {
        return new GridColumnHeader({ services: this._services, ...parameters });
    }

    public render(): void {
        this.events.dispatchEvent('onRenderRequested');
    }

    public getMenuItems(header: IGridColumnHeader): IContextualMenuItem[] {
        const sections: IColumnMenuSection[] = [];
        this.hooks.menuSections.apply(sections, header);
        const items = sections
            .filter(section => section.items.length > 0)
            .flatMap(section => [{
                key: `${section.key}Header`,
                itemType: ContextualMenuItemType.Header,
                text: section.title,
                //a heading names the entries under it
                onRenderIcon: () => null,
            }, ...section.items]);
        this.hooks.menuItems.apply(items, header);
        return items;
    }

    public applyColumnHeaderThemeHooks(builder: ThemeBuilder, header: IGridColumnHeader): void {
        this.hooks.theme.apply(builder, header);
    }

    public getAdornments(header: IGridColumnHeader): IColumnHeaderAdornment[] {
        const adornments: IColumnHeaderAdornment[] = [];
        this.hooks.adornments.apply(adornments, header);
        return adornments;
    }
}
