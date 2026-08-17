import { IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy } from "@components/TaskGrid/providers";
import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid";
import { IMemoryEntitySource } from "./interfaces";
import { IMemoryTaskStrategyDependencies, MemoryTaskStrategy } from "./MemoryTaskStrategy";
import { MemorySavedQueryStrategy } from "./MemorySavedQueryStrategy";

/** Dependencies resolved by {@link IMemoryTaskGridDescriptorParams} — see the interface for details. */
export interface IMemoryTaskGridDescriptorParams extends IMemoryTaskStrategyDependencies {
    /** Maps the column roles the grid needs (subject, parent, stack rank, state code) onto your column names. */
    fieldMapping: IFieldMapping;
    /** Built-in, non-deletable views shown in the view switcher. At least one is required. */
    systemQueries: ISavedQuery[];
    /** Initial personal views. Editable and deletable at runtime; defaults to none. */
    userQueries?: ISavedQuery[];
    /**
     * Candidate entities for lookup-many columns, keyed by task column name. Which columns *render*
     * as lookup-many is driven by `metadata.LookupMany` on the column itself, not by these keys.
     */
    lookupMany?: Record<string, IMemoryEntitySource>;
    /** Feature flags forwarded to the grid. See {@link ITaskGridParameters}. */
    gridParameters?: ITaskGridParameters;
    /**
     * Supplies a strategy for deep customization of AG Grid column definitions, cell renderers,
     * editors and row class rules. Lookup-many columns are already handled natively, so this is only
     * needed for customizations of your own.
     */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} backed entirely by in-memory data — no Dataverse, no
 * network, no `Xrm.WebApi`. Intended for local development, tests, Storybook and demos.
 *
 * Wires up the task, saved-query and grid-customizer strategies from a single parameter object.
 * Dependencies — the seed data included — are resolved through `onInitialize`, so they can be
 * fetched, generated or lazily imported while the grid shows its loading state.
 *
 * @example
 * ```ts
 * const descriptor = new MemoryTaskGridDescriptor({
 *   height: '600px',
 *   onInitialize: async () => {
 *     const { TASKS, TASK_COLUMNS, TASK_METADATA } = await import('./fixtures');
 *     return {
 *       tasks: { records: TASKS, columns: TASK_COLUMNS, metadata: TASK_METADATA },
 *       fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
 *       systemQueries: [allTasksView],
 *     };
 *   },
 * });
 * ```
 */
/** Resolved once by `onLoadDependencies`, before any strategy or data provider is created. */
interface IResolvedState {
    params: IMemoryTaskGridDescriptorParams;
    savedQueryStrategy: MemorySavedQueryStrategy;
}

export class MemoryTaskGridDescriptor implements ITaskGridDescriptor {
    private _onInitialize: () => Promise<IMemoryTaskGridDescriptorParams>;
    private _height?: string;
    private _state?: IResolvedState;

    /**
     * @param params.onInitialize — resolves the descriptor configuration. Awaited once, before any
     * strategy or data provider is created.
     * @param params.height — container height. Kept outside `onInitialize` because it is needed for
     * skeleton rendering before the dependencies resolve.
     */
    constructor(params: { onInitialize: () => Promise<IMemoryTaskGridDescriptorParams>; height?: string }) {
        this._onInitialize = params.onInitialize;
        this._height = params.height;
    }

    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    public async onLoadDependencies(): Promise<void> {
        const params = await this._onInitialize();
        if (params.systemQueries.length === 0) {
            throw new Error('MemoryTaskGridDescriptor requires at least one system query.');
        }
        this._state = {
            params: params,
            savedQueryStrategy: new MemorySavedQueryStrategy({
                onGetSystemQueries: async () => params.systemQueries,
                userQueries: params.userQueries,
            }),
        };
    }

    //kept separate from onGetGridParameters because the skeleton needs it before the instance exists
    public onGetHeight(): string | undefined {
        return this._height;
    }

    public onGetFieldMapping(): IFieldMapping {
        return this._getState().params.fieldMapping;
    }

    public onGetGridParameters(): ITaskGridParameters {
        return this._getState().params.gridParameters ?? {};
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return this._getState().savedQueryStrategy;
    }

    public onCreateUserQueryDataProvider(): IDataProvider {
        return this._getState().savedQueryStrategy.createDataProvider();
    }

    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        const { params } = this._getState();
        //the params are a superset of the strategy's dependencies, so they pass straight through -
        //nothing to keep in sync as either interface grows
        return new MemoryTaskStrategy({ onInitialize: async () => params }, deps);
    }

    public onCreateTemplateDataProvider(): IDataProvider | undefined {
        const { templates } = this._getState().params;
        return templates && this._createDataProvider(templates);
    }

    /** Builds the picker's candidate provider from the {@link IMemoryTaskGridDescriptorParams.lookupMany} entry for the column. */
    public onCreateLookupManyDataProvider({ column }: ILookupManyDataProviderParameters): IDataProvider {
        const source = this._getState().params.lookupMany?.[column.name];
        if (!source) {
            throw new Error(`No lookup-many source is configured for column "${column.name}". Add an entry for it to the "lookupMany" parameter.`);
        }
        return this._createDataProvider(source);
    }

    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy | undefined {
        return this._getState().params.onCreateGridCustomizerStrategy?.();
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private _createDataProvider(source: IMemoryEntitySource): IDataProvider {
        const provider = new MemoryDataProvider({
            dataSource: source.records,
            metadata: source.metadata,
        });
        provider.setColumns(source.columns);
        return provider;
    }

    private _getState(): IResolvedState {
        if (!this._state) {
            throw new Error('MemoryTaskGridDescriptor has not been initialized yet. The TaskGrid calls onLoadDependencies before any other hook.');
        }
        return this._state;
    }
}
