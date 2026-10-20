import { IDataProvider, IEventEmitter, EventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import { HookRegistry, IStateStore, LocalizationService, ServiceLocator } from "@utils";
import type { IDatasetControlProps } from "../components/adapters/root/Root";
import { DATASET_CONTROL_LABELS } from "../components/adapters/root/labels";
import { IDatasetControl, IDatasetControlEvents, IDatasetControlModule, IDatasetControlModuleLocator, IDatasetControlModuleMap, IDatasetControlPartLocator, IDatasetControlServiceLocator, IDatasetControlServiceMap, IDatasetControlView } from "./interfaces";
import { DatasetControlUnsavedChangesGuard } from "./DatasetControlUnsavedChangesGuard";
import { DatasetControlState } from "./DatasetControlState";
import { DatasetControlSurfaces, IDatasetControlSurfaces } from "./DatasetControlSurfaces";

/** What `onLoad` is called with. */
export interface IDatasetControlLoadParameters<TData = unknown> {
    /** The view to load: the one asked for or kept, else the first view; `undefined` only when there are no views. */
    view?: IDatasetControlView<TData>;
}

/** What `onLoad` returns. */
export interface IDatasetControlLoadResult {
    /** The provider every part works on. */
    provider: IDataProvider;
}

/** A hook over the views `onLoadViews` returned, which it adds to or changes in place. */
export type DatasetControlViewsHook = (views: IDatasetControlView[]) => void;

/** What the parts, the Grid and the skeleton need beside the consumer's API. */
export interface IDatasetControlRuntime extends IDatasetControl {
    readonly events: IEventEmitter<IDatasetControlEvents>;
    readonly services: IDatasetControlServiceLocator;
    /** The control's height, as the `height` prop gives it. */
    getHeight(): string | undefined;
    /** Where the parts keep their state for a view: the one shown, unless another is given. */
    getViewStateStore(viewId?: string): IStateStore;
    /**
     * Registers a hook over the views, applied on every load after `onLoadViews`.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerViews(hook: DatasetControlViewsHook, priority?: number): () => void;
}

export interface IDatasetControlRuntimeParameters {
    onGetProps: () => IDatasetControlProps;
    /** The control's state, which outlives the runtime. */
    state: DatasetControlState;
    /** Mounts the control anew on the view the state is on. */
    onRemount: () => void;
}

export class DatasetControlRuntime implements IDatasetControlRuntime {
    public readonly events: IEventEmitter<IDatasetControlEvents> = new EventEmitter<IDatasetControlEvents>();
    private _services = new ServiceLocator<IDatasetControlServiceMap>();
    private _modules = new ServiceLocator<IDatasetControlModuleMap>();
    private _loadedModules: { module: IDatasetControlModule; instance: unknown }[] = [];
    private _surfaces = new DatasetControlSurfaces();
    private _onGetProps: () => IDatasetControlProps;
    private _state: DatasetControlState;
    private _onRemount: () => void;
    private _provider?: IDataProvider;
    private _views: IDatasetControlView[] = [];
    private _viewsHooks = new HookRegistry<DatasetControlViewsHook>();
    private _viewId?: string;
    private _requestedViewId?: string;
    private _isLoading = false;
    private _isDestroyed = false;
    private _error?: unknown;

    constructor(parameters: IDatasetControlRuntimeParameters) {
        const props = parameters.onGetProps();
        const labels = new LocalizationService({ ...DATASET_CONTROL_LABELS, ...props.labels });
        this._onGetProps = parameters.onGetProps;
        this._state = parameters.state;
        this._onRemount = parameters.onRemount;
        this._services.register('runtime', () => this);
        this._services.register('labels', () => labels);
        this._services.register('surfaces', () => this._surfaces);
        new DatasetControlUnsavedChangesGuard({ runtime: this, labels });
    }

    public get services(): IDatasetControlServiceLocator {
        return this._services;
    }

    public get parts(): IDatasetControlPartLocator {
        return this._services;
    }

    public get modules(): IDatasetControlModuleLocator {
        return this._modules;
    }

    public get surfaces(): IDatasetControlSurfaces {
        return this._surfaces;
    }

    public getProvider(): IDataProvider | undefined {
        return this._provider;
    }

    public getViews(): IDatasetControlView[] {
        return this._views;
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

    public registerViews(hook: DatasetControlViewsHook, priority?: number): () => void {
        return this._viewsHooks.register(hook, priority);
    }

    public getHeight(): string | undefined {
        return this._onGetProps().height;
    }

    public getError(): unknown {
        return this._error;
    }

    public async load(): Promise<void> {
        await this._load(this._state.getViewId());
    }

    public async loadView(viewId: string): Promise<void> {
        await this._remountBehindBlocker(viewId);
    }

    public async reload(): Promise<void> {
        await this._remountBehindBlocker(this._viewId);
    }

    public async retry(): Promise<void> {
        if (!this._isDestroyed) {
            this._remount(this._requestedViewId);
        }
    }

    public destroy(): void {
        this._isDestroyed = true;
        this.events.dispatchEvent('onDestroyed');
        this._destroyModules();
        if (this._provider) {
            this._state.save(this._provider, this._viewId);
            this._releaseProvider(this._provider);
        }
        this.events.clearEventListeners();
        this._services.destroy();
        this._modules.destroy();
    }

    private async _remountBehindBlocker(viewId: string | undefined): Promise<void> {
        const provider = this._provider as IInternalDataProvider | undefined;
        if (this._isDestroyed) {
            return;
        }
        if (!provider) {
            this._remount(viewId);
            return;
        }
        //resolves without remounting when the user keeps their unsaved changes
        await provider.executeWithUnsavedChangesBlocker(() => this._remount(viewId));
    }

    private _remount(viewId: string | undefined): void {
        this._state.setViewId(viewId);
        this._onRemount();
    }

    private async _load(requestedViewId: string | undefined): Promise<void> {
        this._isLoading = true;
        this._requestedViewId = requestedViewId;
        this._error = undefined;
        this.events.dispatchEvent('onLoadStarted');
        let result: IDatasetControlLoadResult | undefined;
        let viewId: string | undefined;
        try {
            await this._loadModules();
            //a copy: the hooks change it in place
            const views = [...await this._onGetProps().onLoadViews?.() ?? []];
            this._viewsHooks.apply(views);
            this._views = views;
            viewId = this._resolveViewId(requestedViewId);
            result = await this._onGetProps().onLoad({ view: this._views.find(view => view.id === viewId) });
            const provider = result.provider;
            this._state.restore(provider, viewId);
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
        this._onLoaded(result, viewId);
    }

    //a retried load starts the modules again from scratch
    private async _loadModules(): Promise<void> {
        this._destroyModules();
        const names = new Set<string>();
        for (const module of this._onGetProps().modules ?? []) {
            if (names.has(module.name)) {
                throw new Error(`Module "${module.name}" is registered twice.`);
            }
            names.add(module.name);
            const instance = await module.onLoad(this);
            this._loadedModules.push({ module, instance });
            this._modules.register(module.name, () => instance as IDatasetControlModuleMap[typeof module.name]);
        }
    }

    private _destroyModules(): void {
        for (const { module, instance } of this._loadedModules) {
            module.onDestroy?.(instance as never);
            this._modules.unregister(module.name);
        }
        this._loadedModules = [];
    }

    //a kept view may have been removed since
    private _resolveViewId(viewId: string | undefined): string | undefined {
        return this._views.some(view => view.id === viewId) ? viewId : this._views[0]?.id;
    }

    private _onLoaded(result: IDatasetControlLoadResult, viewId: string | undefined): void {
        this._provider = result.provider;
        this._viewId = viewId;
        this._state.setViewId(viewId);
        this._isLoading = false;
        this.events.dispatchEvent('onLoaded', result.provider);
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
