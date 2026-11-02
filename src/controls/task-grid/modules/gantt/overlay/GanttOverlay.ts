import { EventEmitter, IDataProvider, IEventEmitter } from "@talxis/client-libraries";

const PROVIDER_LOADING_KEY = 'providerLoading';

export interface IGanttOverlayEvents {
    onVisibilityChanged: (isVisible: boolean) => void;
}

/** A cover that blocks the Gantt while any key, the provider's loading among them, holds it. */
export interface IGanttOverlay {
    readonly events: IEventEmitter<IGanttOverlayEvents>;
    isVisible(): boolean;
    /** Keeps the cover up until `hide` is called with the same key. */
    show(key: string): void;
    /** Releases the key, leaving the cover while another key holds it. */
    hide(key: string): void;
}

export class GanttOverlay implements IGanttOverlay {
    public readonly events = new EventEmitter<IGanttOverlayEvents>();
    private _provider: IDataProvider;
    private _keys = new Set<string>();
    private _offLoading: () => void;

    constructor(provider: IDataProvider) {
        this._provider = provider;
        this._offLoading = provider.addEventListener('onLoading', this._onLoading);
        this._onLoading();
    }

    public isVisible(): boolean {
        return this._keys.size > 0;
    }

    public show(key: string): void {
        const wasVisible = this.isVisible();
        this._keys.add(key);
        this._dispatchIfChanged(wasVisible);
    }

    public hide(key: string): void {
        const wasVisible = this.isVisible();
        this._keys.delete(key);
        this._dispatchIfChanged(wasVisible);
    }

    //the provider outlives the Gantt
    public destroy(): void {
        this._offLoading();
    }

    private _onLoading = (): void => {
        if (this._provider.isLoading()) {
            this.show(PROVIDER_LOADING_KEY);
        }
        else {
            this.hide(PROVIDER_LOADING_KEY);
        }
    };

    private _dispatchIfChanged(wasVisible: boolean): void {
        if (this.isVisible() !== wasVisible) {
            this.events.dispatchEvent('onVisibilityChanged', this.isVisible());
        }
    }
}
