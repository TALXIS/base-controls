import { IDatasetControlServiceLocator, IDatasetControlView } from "../../../runtime/interfaces";

export interface IDatasetControlViewSwitcherParameters {
    services: IDatasetControlServiceLocator;
}

/** The views `onLoad` returned, and switching between them. */
export class DatasetControlViewSwitcher {
    private _services: IDatasetControlServiceLocator;

    constructor(parameters: IDatasetControlViewSwitcherParameters) {
        this._services = parameters.services;
        this._services.register('viewSwitcher', () => this);
    }

    public getViews(): IDatasetControlView[] {
        return this._services.get('runtime').getViews();
    }

    /** `undefined` when the loaded view is not among the views `onLoad` returned. */
    public getCurrentView(): IDatasetControlView | undefined {
        const viewId = this._services.get('runtime').getViewId();
        return this.getViews().find(view => view.id === viewId);
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
    }
}
