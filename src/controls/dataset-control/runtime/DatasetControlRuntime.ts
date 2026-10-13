import { IDataProvider, IEventEmitter, EventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import { IStateStore, LocalizationService, ServiceLocator, StateStore } from "@utils";
import type { IDatasetControlProps } from "../components/adapters/root/Root";
import { DATASET_CONTROL_LABELS } from "../components/adapters/root/labels";
import { IDatasetControl, IDatasetControlEvents, IDatasetControlPartLocator, IDatasetControlServiceLocator, IDatasetControlServiceMap } from "./interfaces";
import { DatasetControlUnsavedChangesGuard } from "./DatasetControlUnsavedChangesGuard";
import { DatasetControlState } from "./DatasetControlState";

/** What `onLoad` is called with. */
export interface IDatasetControlLoadParameters {
    /** The view to load; `undefined` on a first load with none kept, for `onLoad` to pick the default. */
    viewId?: string;
}

/** What `onLoad` returns. */
export interface IDatasetControlLoadResult {
    /** The provider every part works on. */
    provider: IDataProvider;
    /** The view `provider` shows, when `onLoad` picked the default. */
    viewId?: string;
}

/** What the parts, the Grid and the skeleton need beside the consumer's API. */
export interface IDatasetControlRuntime extends IDatasetControl {
    readonly events: IEventEmitter<IDatasetControlEvents>;
    readonly services: IDatasetControlServiceLocator;
    /** Changes with every provider, for keying what renders it. */
    getProviderKey(): number;
    /** The control's height, as the `height` prop gives it. */
    getHeight(): string | undefined;
    /** Where the parts keep their state for a view: the one shown, unless another is given. */
    getViewStateStore(viewId?: string): IStateStore;
}

export interface IDatasetControlRuntimeParameters {
    onGetProps: () => IDatasetControlProps;
    /** Where the control keeps its state, under its `id`. */
    stateStore: IStateStore;
}

export class DatasetControlRuntime implements IDatasetControlRuntime {
    public readonly events: IEventEmitter<IDatasetControlEvents> = new EventEmitter<IDatasetControlEvents>();
    private _services = new ServiceLocator<IDatasetControlServiceMap>();
    private _onGetProps: () => IDatasetControlProps;
    private _state: DatasetControlState;
    private _provider?: IDataProvider;
    private _providerKey = 0;
    private _viewId?: string;
    private _requestedViewId?: string;
    private _isLoading = false;
    private _isDestroyed = false;
    private _error?: unknown;

    constructor(parameters: IDatasetControlRuntimeParameters) {
        const props = parameters.onGetProps();
        const labels = new LocalizationService({ ...DATASET_CONTROL_LABELS, ...props.labels });
        this._onGetProps = parameters.onGetProps;
        this._state = new DatasetControlState({ store: props.stateKey ? parameters.stateStore.scope(props.stateKey) : new StateStore() });
        this._services.register('runtime', () => this);
        this._services.register('labels', () => labels);
        new DatasetControlUnsavedChangesGuard({ runtime: this, labels });
    }

    public get services(): IDatasetControlServiceLocator {
        return this._services;
    }

    public get parts(): IDatasetControlPartLocator {
        return this._services;
    }

    public getProvider(): IDataProvider | undefined {
        return this._provider;
    }

    public getProviderKey(): number {
        return this._providerKey;
    }

    public getViewId(): string | undefined {
        return this._viewId;
    }

    public getViewStateStore(viewId: string | undefined = this._viewId): IStateStore {
        return this._state.getViewStore(viewId);
    }

    public isLoading(): boolean {
        return this._isLoading;
    }

    public getHeight(): string | undefined {
        return this._onGetProps().height;
    }

    public getError(): unknown {
        return this._error;
    }

    public async load(): Promise<void> {
        await this._load({ viewId: this._state.getViewId() });
    }

    public async loadView(viewId: string): Promise<void> {
        await this._loadBehindBlocker({ viewId });
    }

    public async reload(): Promise<void> {
        await this._loadBehindBlocker({ viewId: this._viewId });
    }

    public async retry(): Promise<void> {
        await this._loadBehindBlocker({ viewId: this._requestedViewId });
    }

    public destroy(): void {
        this._isDestroyed = true;
        this.events.dispatchEvent('onDestroyed');
        if (this._provider) {
            this._state.save(this._provider, this._viewId);
            this._releaseProvider(this._provider);
        }
        this.events.clearEventListeners();
        this._services.destroy();
    }

    private async _loadBehindBlocker(parameters: IDatasetControlLoadParameters): Promise<void> {
        const provider = this._provider as IInternalDataProvider | undefined;
        if (!provider) {
            await this._load(parameters);
            return;
        }
        //resolves without loading when the user keeps their unsaved changes
        await provider.executeWithUnsavedChangesBlocker(() => this._load(parameters));
    }

    private async _load(parameters: IDatasetControlLoadParameters): Promise<void> {
        //the view being left comes back as it was the next time it loads
        if (this._provider) {
            this._state.save(this._provider, this._viewId);
        }
        this._isLoading = true;
        this._requestedViewId = parameters.viewId;
        this._error = undefined;
        this.events.dispatchEvent('onLoadStarted');
        let result: IDatasetControlLoadResult | undefined;
        try {
            result = await this._onGetProps().onLoad(parameters);
            const provider = result.provider;
            this._state.restore(provider, result.viewId ?? parameters.viewId);
            //onLoad may have prepared and started the first load itself
            if (!provider.isFirstLoadRequested()) {
                await provider.preload();
                await provider.getPaging().loadExactPage(provider.getPaging().pageNumber);
            }
        }
        catch (error) {
            if (result) {
                this._releaseProvider(result.provider);
            }
            this._onLoadFailed(error);
            return;
        }
        if (this._isDestroyed) {
            this._releaseProvider(result.provider);
            return;
        }
        this._onLoaded(result, parameters);
    }

    private _onLoaded(result: IDatasetControlLoadResult, parameters: IDatasetControlLoadParameters): void {
        const previous = this._provider;
        this._provider = result.provider;
        this._providerKey++;
        this._viewId = result.viewId ?? parameters.viewId;
        this._isLoading = false;
        this.events.dispatchEvent('onLoaded', result.provider);
        //onLoaded has remounted every part on the new provider
        if (previous) {
            this._releaseProvider(previous);
        }
    }

    private _onLoadFailed(error: unknown): void {
        if (this._isDestroyed) {
            return;
        }
        this._error = error;
        this._isLoading = false;
        this.events.dispatchEvent('onLoadFailed', error);
    }

    private _releaseProvider(provider: IDataProvider): void {
        if (this._onGetProps().destroyProviderOnUnmount !== false) {
            provider.destroy();
        }
    }
}
