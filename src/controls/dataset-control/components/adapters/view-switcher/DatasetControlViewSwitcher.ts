import type { IContextualMenuItem } from "@fluentui/react";
import { HookRegistry } from "@utils";
import { IDatasetControlServiceLocator, IDatasetControlView } from "../../../runtime/interfaces";

/** A hook over the switcher's menu, which it adds to or changes in place; it runs after the views are listed. */
export type ViewSwitcherItemsHook = (items: IContextualMenuItem[]) => void;


export interface IDatasetControlViewSwitcherParameters {
    services: IDatasetControlServiceLocator;
}

/** The control's views, and switching between them. */
export interface IDatasetControlViewSwitcher {
    /** The views of this mount, from the control's `onLoadViews`. */
    getViews(): IDatasetControlView[];
    /** `undefined` when the loaded view is not among the views. */
    getCurrentView(): IDatasetControlView | undefined;
    /** Loads the control for the view. */
    select(viewId: string): void;
    /**
     * Registers a hook over the switcher's menu.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerItems(hook: ViewSwitcherItemsHook, priority?: number): () => void;
}

export class DatasetControlViewSwitcher implements IDatasetControlViewSwitcher {
    private _services: IDatasetControlServiceLocator;
    private _itemsHooks = new HookRegistry<ViewSwitcherItemsHook>();

    constructor(parameters: IDatasetControlViewSwitcherParameters) {
        this._services = parameters.services;
    }

    public getViews(): IDatasetControlView[] {
        return this._services.get('runtime').getViews();
    }

    public getCurrentView(): IDatasetControlView | undefined {
        const viewId = this._services.get('runtime').getViewId();
        return this.getViews().find(view => view.id === viewId);
    }

    public select(viewId: string): void {
        const runtime = this._services.get('runtime');
        if (viewId !== runtime.getViewId()) {
            runtime.loadView(viewId);
        }
    }

    public registerItems(hook: ViewSwitcherItemsHook, priority?: number): () => void {
        return this._itemsHooks.register(hook, priority);
    }

    /** The menu with what the hooks added to it. */
    public getItems(items: IContextualMenuItem[]): IContextualMenuItem[] {
        const result = [...items];
        this._itemsHooks.apply(result);
        return result;
    }

    public destroy(): void {
    }
}
