import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { IDatasetControlServiceLocator, IDatasetControlView } from "../../../runtime/interfaces";

export interface IDatasetControlViewSwitcherEvents {
    /** Fired when a load starts, once the previous load's error is cleared. */
    onBeforeLoad: () => void;
    /** Fired when a load finishes, whether it returned views or threw. */
    onLoaded: () => void;
}

export interface IDatasetControlViewSwitcherParameters {
    services: IDatasetControlServiceLocator;
    onLoad: () => Promise<IDatasetControlView[]>;
}

/** The views the switcher's `onLoad` returns, and switching between them. */
export class DatasetControlViewSwitcher {
    public readonly events: IEventEmitter<IDatasetControlViewSwitcherEvents> = new EventEmitter<IDatasetControlViewSwitcherEvents>();
    private _services: IDatasetControlServiceLocator;
    private _onLoad: () => Promise<IDatasetControlView[]>;
    private _views?: IDatasetControlView[];
    private _error?: unknown;
    //a slower earlier load must not overwrite a newer one
    private _latestLoad?: Promise<IDatasetControlView[]>;

    constructor(parameters: IDatasetControlViewSwitcherParameters) {
        this._services = parameters.services;
        this._onLoad = parameters.onLoad;
        this._services.register('viewSwitcher', () => this);
    }

    /** `undefined` until the first load finishes. */
    public getViews(): IDatasetControlView[] | undefined {
        return this._views;
    }

    /** What the last load threw, until the next one starts. */
    public getError(): unknown {
        return this._error;
    }

    /** `undefined` when the loaded view is not among the views. */
    public getCurrentView(): IDatasetControlView | undefined {
        const viewId = this._services.get('runtime').getViewId();
        return this._views?.find(view => view.id === viewId);
    }

    /** Calls `onLoad` again; the latest call's views win. */
    public async reload(): Promise<void> {
        const load = this._onLoad();
        this._latestLoad = load;
        this._error = undefined;
        this.events.dispatchEvent('onBeforeLoad');
        try {
            const views = await load;
            if (load === this._latestLoad) {
                this._views = views;
            }
        }
        catch (error) {
            if (load === this._latestLoad) {
                this._error = error;
            }
        }
        this.events.dispatchEvent('onLoaded');
    }

    /** Reloads the control for the view. */
    public select(viewId: string): void {
        const runtime = this._services.get('runtime');
        if (viewId !== runtime.getViewId()) {
            runtime.reload({ viewId });
        }
    }

    public destroy(): void {
        if (this._services.find('viewSwitcher') === this) {
            this._services.unregister('viewSwitcher');
        }
        this.events.clearEventListeners();
    }
}
