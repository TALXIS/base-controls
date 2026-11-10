import type { ITheme } from "@fluentui/react";
import { IAvailableRelatedColumn, IColumn, IDataProvider, IInternalDataProvider, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import { HookRegistry, IStateStore, ModuleLoader, Runtime, RuntimeLifecycle, ServiceRegistry, IHookPoint } from "@core";
import { ILabels, ILabelSet, Labels, LabelsService } from "@labels";
import type { IDatasetControlProps } from "../adapters/root/Root";
import { IDatasetControl, IDatasetControlModuleLocator, IDatasetControlModuleMap, IDatasetControlPartLocator, IDatasetControlServiceRegistry, IDatasetControlServiceMap, IDatasetControlView, IDatasetControlResolvedView, IDatasetControlViewColumn } from "./interfaces";
import { toScopedColumn } from "./parts/edit-columns/toScopedColumn";
import { DatasetControlUnsavedChangesGuard } from "./DatasetControlUnsavedChangesGuard";
import { DatasetControlState } from "./DatasetControlState";
import { DatasetControlSurfaces, IDatasetControlSurfaces } from "./DatasetControlSurfaces";

/** What `onLoad` returns. */
export interface IDatasetControlLoadResult<TData = unknown> {
    /** The provider every part works on. */
    provider: IDataProvider;
    /** The views to switch between; leave out for a control with one view. */
    views?: IDatasetControlView<TData>[];
    /** Whether the control destroys the provider when it lets it go, on unmount and reload; defaults to `true`. */
    destroyProviderOnUnmount?: boolean;
}

/** A hook over the views `onLoad` returned, which it adds to or changes in place. */
export type DatasetControlViewsHook = (views: IDatasetControlView[]) => void;

/** What the parts, the Grid and the skeleton need beside the consumer's API. */
export interface IDatasetControlHooks {
    /** The views, applied on every load after `onLoad`. */
    readonly views: IHookPoint<DatasetControlViewsHook>;
}

export interface IDatasetControlInternal extends IDatasetControl {
    readonly services: IDatasetControlServiceRegistry;
    /** The control's height, as the `height` prop gives it. */
    getHeight(): string | undefined;
    /** Where the parts keep their state for a view: the one shown, unless another is given. */
    getViewStateStore(viewId?: string): IStateStore;
    readonly hooks: IDatasetControlHooks;
}

export interface IDatasetControlRuntimeParameters {
    getProps: () => IDatasetControlProps;
    /** The control's state, which outlives the runtime: the next mount opens the view it is on. */
    state: DatasetControlState;
    getLabelsService: () => LabelsService;
    theme: ITheme;
}

export class DatasetControlRuntime extends Runtime implements IDatasetControlInternal {
    public readonly lifecycle = new RuntimeLifecycle({
        onInit: () => this._init(),
        onDestroy: () => this._destroy(),
    });
    private _services = new ServiceRegistry<IDatasetControlServiceMap>();
    private _moduleLoader = new ModuleLoader<IDatasetControlModuleMap, IDatasetControlInternal>();
    private _surfaces = new DatasetControlSurfaces();
    private _getProps: () => IDatasetControlProps;
    private _theme: ITheme;
    private _state: DatasetControlState;
    private _provider?: IDataProvider;
    private _isProviderOwned = true;
    private _views: IDatasetControlView[] = [];
    public readonly hooks = {
        views: new HookRegistry<DatasetControlViewsHook>(),
    };
    private _viewId?: string;
    private _view?: IDatasetControlResolvedView;

    constructor(parameters: IDatasetControlRuntimeParameters) {
        super();
        this._getProps = parameters.getProps;
        this._theme = parameters.theme;
        this._state = parameters.state;
        this._services.provide('runtime', this);
        this._services.provide('labels', { getLabels: set => parameters.getLabelsService().getLabels(set) });
        this._services.provide('surfaces', this._surfaces);
        new DatasetControlUnsavedChangesGuard({ runtime: this });
    }

    public get services(): IDatasetControlServiceRegistry {
        return this._services;
    }

    public get parts(): IDatasetControlPartLocator {
        return this._services;
    }

    public get modules(): IDatasetControlModuleLocator {
        return this._moduleLoader.modules;
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

    public getView(): IDatasetControlResolvedView | undefined {
        return this._view;
    }

    public getViewStateStore(viewId: string | undefined = this._viewId): IStateStore {
        return this._state.getViewStore(viewId);
    }

    public getStateStore(): IStateStore {
        return this.getViewStateStore();
    }

    public getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T> {
        return this._services.get('labels').getLabels(set);
    }

    public getTheme(): ITheme {
        return this._theme;
    }

    public getHeight(): string | undefined {
        return this._getProps().height;
    }

    public async loadView(viewId: string): Promise<void> {
        await this._remountBehindBlocker(viewId);
    }

    public async reload(): Promise<void> {
        await this._remountBehindBlocker(this._viewId);
    }

    private _destroy(): void {
        //before the provider is released, which the modules may still read
        this._moduleLoader.destroy();
        if (this._provider) {
            this._state.save(this._provider, this._viewId);
            this._releaseProvider(this._provider);
        }
        this._services.destroy();
    }

    private async _remountBehindBlocker(viewId: string | undefined): Promise<void> {
        const remount = () => {
            this._state.setViewId(viewId);
            this.lifecycle.remount();
        };
        const provider = this._provider as IInternalDataProvider | undefined;
        if (!provider) {
            remount();
            return;
        }
        //resolves without remounting when the user keeps their unsaved changes
        await provider.executeWithUnsavedChangesBlocker(remount);
    }

    private async _init(): Promise<void> {
        await this._moduleLoader.load(this._getProps().modules ?? [], this);
        const { provider, views = [], destroyProviderOnUnmount } = await this._getProps().onLoad(this);
        this._isProviderOwned = destroyProviderOnUnmount !== false;
        try {
            //a copy: the hooks change it in place
            const listedViews = [...views];
            this.hooks.views.apply(listedViews);
            this._views = listedViews;
            //a failed view stays on the state, so the remount that retries it opens it again
            const viewId = this._resolveViewId(this._state.getViewId());
            const listed = this._views.find(view => view.id === viewId);
            if (listed) {
                this._view = { ...listed, ...await listed.resolve(provider) };
                //before the columns, which a related column is resolved through
                const linking = this._view.linking ?? provider.getLinking();
                provider.setLinking(linking);
                provider.setColumns(await this._completeColumns(provider, this._view.columns, linking));
            }
            this._state.restore(provider, viewId);
            //the provider may have prepared and started the first load itself
            if (!provider.isFirstLoadRequested()) {
                await provider.preload();
                await provider.getPaging().loadExactPage(provider.getPaging().pageNumber);
            }
            //the mount went while it loaded, so _destroy has already run without it
            if (this.lifecycle.isDestroyed()) {
                this._releaseProvider(provider);
                return;
            }
            this._provider = provider;
            this._viewId = viewId;
            this._state.setViewId(viewId);
        }
        catch (error) {
            this._releaseProvider(provider);
            throw error;
        }
    }

    //a column the provider does not offer is kept as the view gives it
    private async _completeColumns(provider: IDataProvider, columns: IDatasetControlViewColumn[], linking: ILinkEntityExposedExpression[]): Promise<IColumn[]> {
        const [ownColumns, relatedColumns] = await Promise.all([provider.getAvailableColumns(), this._getRelatedColumns(provider, columns, linking)]);
        const definitions = new Map([...ownColumns, ...relatedColumns].map(column => [column.name, column]));
        return columns.map(column => this._completeColumn(column, definitions.get(column.name)));
    }

    //its own metadata, so the provider setting up one view's column leaves the others alone
    private _completeColumn(column: IDatasetControlViewColumn, definition: IColumn | undefined): IColumn {
        return definition ? { ...definition, ...column, metadata: { ...definition.metadata, ...column.metadata } } : column as IColumn;
    }

    //named as Edit columns names them, through the link each was added through
    private async _getRelatedColumns(provider: IDataProvider, columns: IDatasetControlViewColumn[], linking: ILinkEntityExposedExpression[]): Promise<IColumn[]> {
        const aliases = new Set(columns.filter(column => column.name.includes('.')).map(column => column.name.split('.')[0]));
        const links = linking.filter(link => !!link.alias && aliases.has(link.alias));
        if (links.length === 0) {
            return [];
        }
        const scopes = await provider.getAvailableRelatedColumns();
        const related = await Promise.all(links.map(async link => {
            const scope = scopes.find(scope => this._isScopeOf(scope, link));
            return scope ? (await provider.getAvailableColumns({ entityName: link.name })).map(column => toScopedColumn(column, link, scope)) : [];
        }));
        return related.flat();
    }

    //Edit columns builds a link from the scope's id attribute and lookup
    private _isScopeOf(scope: IAvailableRelatedColumn, link: ILinkEntityExposedExpression): boolean {
        return scope.name === link.to && scope.relatedEntityPrimaryIdAttribute === link.from;
    }

    //a kept view may have been removed since
    private _resolveViewId(viewId: string | undefined): string | undefined {
        return this._views.some(view => view.id === viewId) ? viewId : this._views[0]?.id;
    }

    private _releaseProvider(provider: IDataProvider): void {
        if (this._isProviderOwned) {
            provider.destroy();
        }
    }
}
