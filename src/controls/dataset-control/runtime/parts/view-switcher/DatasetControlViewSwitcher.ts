import type { IContextualMenuItem } from "@fluentui/react";
import { HookRegistry, IHookPoint } from "@core";
import { IDatasetControlServiceLocator, IDatasetControlView } from "../../interfaces";

/** A hook over the switcher's menu, which it adds to or changes in place; it runs after the views are listed. */
export type ViewSwitcherItemsHook = (items: IContextualMenuItem[]) => void;

export interface IDatasetControlViewSwitcherParameters {
    services: IDatasetControlServiceLocator;
}

export interface IDatasetControlViewSwitcherHooks {
    /** The switcher's menu. */
    readonly items: IHookPoint<ViewSwitcherItemsHook>;
}

/** The control's views, and switching between them. */
export interface IDatasetControlViewSwitcher {
    /** The views of this mount, from the control's `onLoad`. */
    getViews(): IDatasetControlView[];
    /** `undefined` when the loaded view is not among the views. */
    getView(): IDatasetControlView | undefined;
    /** Loads the control for the view. */
    select(viewId: string): void;
    readonly hooks: IDatasetControlViewSwitcherHooks;
}

export class DatasetControlViewSwitcher implements IDatasetControlViewSwitcher {
    private _services: IDatasetControlServiceLocator;
    public readonly hooks = {
        items: new HookRegistry<ViewSwitcherItemsHook>(),
    };

    constructor(parameters: IDatasetControlViewSwitcherParameters) {
        this._services = parameters.services;
    }

    public getViews(): IDatasetControlView[] {
        return this._services.get('runtime').getViews();
    }

    public getView(): IDatasetControlView | undefined {
        const viewId = this._services.get('runtime').getViewId();
        return this.getViews().find(view => view.id === viewId);
    }

    public select(viewId: string): void {
        const runtime = this._services.get('runtime');
        if (viewId !== runtime.getViewId()) {
            runtime.loadView(viewId);
        }
    }

    /** The menu with what the hooks added to it. */
    public getItems(items: IContextualMenuItem[]): IContextualMenuItem[] {
        const result = [...items];
        this.hooks.items.apply(result);
        return result;
    }
}
