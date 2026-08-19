import { IDataProvider, IMemoryProviderEntityMetadata, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ICustomColumnsStrategy, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, ITemplateDataProvider, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid";
import { IMemoryEntitySource } from "./interfaces";
import { MemoryTaskStrategy } from "./MemoryTaskStrategy";

/**
 * What the descriptor has resolved by the time it asks for an optional strategy — the counterpart to
 * `IDataverseStrategyContext`.
 */
export interface IMemoryStrategyContext {
    /** The task records resolved by `onInitialize` — the array the strategies write into. */
    records: IRawRecord[];
    /** The task entity metadata resolved by `onInitialize`. */
    metadata: IMemoryProviderEntityMetadata;
    /** The system views resolved by `onInitialize`. */
    systemQueries: ISavedQuery[];
}

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IMemoryTaskStrategyContext extends IMemoryStrategyContext {
    /** The providers and flags the grid built. Forward them to the strategy's second argument. */
    deps: ITaskStrategyDeps;
}

/** Everything `onInitialize` resolves — the data and the options both. */
export interface IMemoryTaskGridDescriptorParams {
    /**
     * The task records. **This array is written into** — creating, deleting, editing and moving tasks
     * mutates it, which is how the data outlives the grid's remounts.
     */
    records: IRawRecord[];
    /** Task entity metadata. `PrimaryIdAttribute` is required; `LogicalName` is recommended. */
    metadata: IMemoryProviderEntityMetadata;
    /** Maps the column roles the grid needs (subject, parent, stack rank, state code) onto your column names. */
    fieldMapping: IFieldMapping;
    /** Built-in, non-deletable views shown in the view switcher — and the source of every column definition. At least one is required. */
    systemQueries: ISavedQuery[];
    /**
     * Candidate entities for lookup-many columns, keyed by task column name. Which columns *render*
     * as lookup-many is driven by `metadata.LookupMany` on the column itself, not by these keys.
     */
    lookupMany?: Record<string, IMemoryEntitySource>;
    /** Feature flags forwarded to the grid. See {@link ITaskGridParameters}. */
    gridParameters?: ITaskGridParameters;
    /**
     * (Optional) Supplies the task strategy — this is where every task-level option goes:
     *
     * ```ts
     * onCreateTaskStrategy: ({ deps, records, metadata }) => new MemoryTaskStrategy({
     *     onInitialize: async () => ({
     *         records, metadata,
     *         onGetNewTaskDefaults: () => ({ statuscode: 1, priority: 1 }),
     *         onIsRecordActive: record => record.statuscode !== 5,
     *         onOpenDatasetItems: async references => { … },
     *     }),
     * }, deps)
     * ```
     *
     * Omit it and the descriptor builds a plain `MemoryTaskStrategy` over the resolved records.
     */
    onCreateTaskStrategy?: (context: IMemoryTaskStrategyContext) => ITaskDataProviderStrategy;
    /**
     * (Optional) Supplies the personal-views implementation — typically
     * `new MemoryUserQueryStrategy({ userQueries })`, or your own if the views are persisted somewhere.
     * What you return decides whether the feature exists; omit it and personal views are off.
     *
     * The feature callbacks all work that way, and all of them receive what the descriptor resolved.
     */
    onCreateUserQueryStrategy?: (context: IMemoryStrategyContext) => IUserQueryStrategy | undefined;
    /**
     * (Optional) Supplies the template data provider — typically
     * `new MemoryTemplateDataProvider({ templates })`. Omit it and template creation stays out of the
     * ribbon.
     */
    onCreateTemplateDataProvider?: (context: IMemoryStrategyContext) => ITemplateDataProvider | undefined;
    /**
     * (Optional) Supplies a custom-columns strategy. There is no in-memory implementation, so this is
     * the only way to switch user-defined columns on with this descriptor.
     */
    onCreateCustomColumnsStrategy?: (context: IMemoryStrategyContext) => ICustomColumnsStrategy | undefined;
    /** (Optional) Supplies a lookup-many picker's candidates, replacing the `lookupMany` lookup. */
    onCreateLookupManyDataProvider?: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
    /**
     * (Optional) Supplies a strategy for deep customization of AG Grid column definitions, cell
     * renderers, editors and row class rules. Lookup-many columns are already handled natively, so this
     * is only needed for customizations of your own.
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
 *     const { TASKS, TASK_METADATA } = await import('./fixtures');
 *     return {
 *       records: TASKS, metadata: TASK_METADATA,
 *       fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
 *       systemQueries: [allTasksView],
 *     };
 *   },
 * });
 * ```
 */
export class MemoryTaskGridDescriptor implements ITaskGridDescriptor {
    private _onInitialize: () => Promise<IMemoryTaskGridDescriptorParams>;
    private _height?: string;
    /**
     * Resolved once and then kept — this is the extension's persistence layer. The collections inside
     * it are mutated in place by the strategies, so everything the user does survives the remounts the
     * grid performs.
     */
    private _params?: IMemoryTaskGridDescriptorParams;

    /**
     * @param params.onInitialize — resolves the descriptor configuration. Awaited once, before any
     * strategy or data provider is created.
     * @param params.height — container height. Kept outside `onInitialize` because it is needed for
     * skeleton rendering before the configuration resolves.
     */
    constructor(params: { onInitialize: () => Promise<IMemoryTaskGridDescriptorParams>; height?: string }) {
        this._onInitialize = params.onInitialize;
        this._height = params.height;
    }

    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    /**
     * The grid calls this again on every remount. Resolving only once is what makes the descriptor a
     * persistence layer: re-running `onInitialize` would hand back fresh arrays and discard the session.
     */
    public async onLoadDependencies(): Promise<void> {
        if (this._params) {
            return;
        }
        const params = await this._onInitialize();
        if (params.systemQueries.length === 0) {
            throw new Error('MemoryTaskGridDescriptor requires at least one system query.');
        }
        this._params = params;
    }

    //kept separate from onGetGridParameters because the skeleton needs it before the instance exists
    public onGetHeight(): string | undefined {
        return this._height;
    }

    public onGetFieldMapping(): IFieldMapping {
        return this._getParams().fieldMapping;
    }

    public onGetGridParameters(): ITaskGridParameters {
        return this._getParams().gridParameters ?? {};
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        const params = this._getParams();
        return {
            onGetSystemQueries: async () => params.systemQueries,
        };
    }

    /**
     * Delegates to the `onCreateUserQueryStrategy` parameter. Returning `undefined` — which is what
     * omitting the parameter does — leaves personal views off.
     */
    public onCreateUserQueryStrategy(): IUserQueryStrategy | undefined {
        return this._getParams().onCreateUserQueryStrategy?.(this._getStrategyContext());
    }

    /**
     * Delegates to the `onCreateTaskStrategy` parameter, falling back to a plain `MemoryTaskStrategy`
     * over the resolved records. Either way the strategy is handed the *same* arrays a rebuilt one gets,
     * so it sees everything its predecessor wrote.
     */
    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        const { records, metadata, onCreateTaskStrategy } = this._getParams();
        return onCreateTaskStrategy?.({ ...this._getStrategyContext(), deps })
            ?? new MemoryTaskStrategy({ onInitialize: async () => ({ records, metadata }) }, deps);
    }

    /** Delegates to the `onCreateTemplateDataProvider` parameter. Templates are off without it. */
    public onCreateTemplateDataProvider(): ITemplateDataProvider | undefined {
        return this._getParams().onCreateTemplateDataProvider?.(this._getStrategyContext());
    }

    /** Delegates to the `onCreateCustomColumnsStrategy` parameter. Custom columns are off without it. */
    public onCreateCustomColumnsStrategy(): ICustomColumnsStrategy | undefined {
        return this._getParams().onCreateCustomColumnsStrategy?.(this._getStrategyContext());
    }

    /**
     * Delegates to the `onCreateLookupManyDataProvider` parameter, falling back to the
     * {@link IMemoryTaskGridDescriptorParams.lookupMany} entry for the column.
     */
    public onCreateLookupManyDataProvider(parameters: ILookupManyDataProviderParameters): IDataProvider {
        const params = this._getParams();
        const dataProvider = params.onCreateLookupManyDataProvider?.(parameters);
        if (dataProvider) {
            return dataProvider;
        }
        const source = params.lookupMany?.[parameters.column.name];
        if (!source) {
            throw new Error(`No lookup-many source is configured for column "${parameters.column.name}". Add an entry for it to the "lookupMany" parameter, or return a provider from "onCreateLookupManyDataProvider".`);
        }
        return this._createDataProvider(source);
    }

    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy | undefined {
        return this._getParams().onCreateGridCustomizerStrategy?.();
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private _createDataProvider(source: IMemoryEntitySource): IDataProvider {
        const provider = new MemoryDataProvider({
            //a copy of the array holding the same records: MemoryDataProvider swaps its internal
            //array on delete, so it must not be handed the one we persist
            dataSource: [...source.records],
            metadata: source.metadata,
        });
        provider.setColumns(source.columns);
        return provider;
    }

    private _getStrategyContext(): IMemoryStrategyContext {
        const { records, metadata, systemQueries } = this._getParams();
        return { records, metadata, systemQueries };
    }

    private _getParams(): IMemoryTaskGridDescriptorParams {
        if (!this._params) {
            throw new Error('MemoryTaskGridDescriptor has not been initialized yet. The TaskGrid calls onLoadDependencies before any other hook.');
        }
        return this._params;
    }
}
