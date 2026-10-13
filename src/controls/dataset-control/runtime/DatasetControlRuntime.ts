import { EventEmitter, IDataProvider, IEventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import { IStateStore, LocalizationService, ServiceLocator, StateStore } from "@utils";
import type { IDatasetControlProps } from "../components/adapters/root/Root";
import { DATASET_CONTROL_LABELS } from "../components/adapters/root/labels";
import { IDatasetControlServiceLocator, IDatasetControlServiceMap } from "./interfaces";
import { DatasetControlUnsavedChangesGuard } from "./DatasetControlUnsavedChangesGuard";
import { DatasetControlState } from "./DatasetControlState";

export interface IDatasetControlRuntimeEvents {
    /** A load started: the first one, a view switch or a reload. */
    onLoadStarted: () => void;
    /** A load finished, and its provider is now the one shown, under a new key. */
    onLoaded: (provider: IDataProvider) => void;
    /** A load failed; the provider shown before it, if any, stays. */
    onLoadFailed: (error: unknown) => void;
    onDestroyed: () => void;
}

export interface IDatasetControlLoadParameters {
    /** The view to load; `undefined` on a first load with none kept, for `onLoad` to pick the default. */
    viewId?: string;
}

export interface IDatasetControlLoadResult {
    provider: IDataProvider;
    /** The view `provider` shows, when `onLoad` picked the default. */
    viewId?: string;
}

/** The control's services, and when it is loaded and gone. */
export interface IDatasetControlRuntime {
    readonly events: IEventEmitter<IDatasetControlRuntimeEvents>;
    readonly services: IDatasetControlServiceLocator;
    /** The provider shown, from the last load that succeeded. */
    getProvider(): IDataProvider | undefined;
    /** Changes with every provider, for keying what renders it. */
    getProviderKey(): number;
    /** The view the provider shown is for. */
    getViewId(): string | undefined;
    /** Where the parts keep their state for a view: the one shown, unless another is given. */
    getViewStateStore(viewId?: string): IStateStore;
    isLoading(): boolean;
    /** The control's height, as the `height` prop gives it. */
    getHeight(): string | undefined;
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Runs `onLoad` again for the view, behind the skeleton, on a new provider; asks first when there are unsaved changes and never rejects. */
    reload(parameters: IDatasetControlLoadParameters): Promise<void>;
    /** Runs the load that failed again. */
    retry(): Promise<void>;
}

export interface IDatasetControlRuntimeParameters {
    onGetProps: () => IDatasetControlProps;
    /** Where the control keeps its state, under its `id`. */
    stateStore: IStateStore;
}

export class DatasetControlRuntime implements IDatasetControlRuntime {
    public readonly events: IEventEmitter<IDatasetControlRuntimeEvents> = new EventEmitter<IDatasetControlRuntimeEvents>();
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

    public async reload(parameters: IDatasetControlLoadParameters): Promise<void> {
        const provider = this._provider as IInternalDataProvider | undefined;
        if (!provider) {
            await this._load(parameters);
            return;
        }
        //resolves without loading when the user keeps their unsaved changes
        await provider.executeWithUnsavedChangesBlocker(() => this._load(parameters));
    }

    public async retry(): Promise<void> {
        await this.reload({ viewId: this._requestedViewId });
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
