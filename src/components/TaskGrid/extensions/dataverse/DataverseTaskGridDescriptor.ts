import { FetchXmlBuilder, ISingleRecord, RecordBuilder } from "@talxis/client-libraries";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ICustomColumnsModule, IGridCustomizerModule, ILookupManyModule, ITaskGridModules, ITemplateModule, IUserQueryModule } from "@components/TaskGrid/modules/interfaces";
import { DataverseTaskStrategy } from "./dataverse-task-strategy/DataverseTaskStrategy";
import { EntityDefinition } from "@talxis/client-metadata";


/** Dataverse-specific field mapping. Extends the base with an optional project lookup column. */
export interface IDataverseFieldMapping extends Omit<IFieldMapping, 'stateCode'> {
    /** Logical name of the lookup attribute that points to the parent project record. Required when `projectRecord` is set on the descriptor. */
    projectId?: string;
}

/** Lightweight entity reference shape used when only logical name + id are available. */
export interface IEntityRecordReference {
    entityName: string;
    id: string;
}

/** Input accepted for source/project: either a fully hydrated record or an entity reference. */
export type RecordInput = IEntityRecordReference | ISingleRecord;

const isSingleRecord = (record: RecordInput | undefined): record is ISingleRecord => {
    return !!record && typeof (record as ISingleRecord).getRecordId === "function";
};

/**
 * What the descriptor has resolved by the time it asks for an optional strategy: the entity name comes
 * from the FetchXML, the record id from `projectRecord`, and the rest straight from the parameters.
 */
export interface IDataverseStrategyContext {
    /** Logical name of the task entity, derived from `baseFetchXml`. */
    entityName: string;
    /** Id of the project record, when one was supplied. */
    recordId?: string;
    /** Id of the current user, from `userId`. */
    userId?: string;
    /** The system views supplied through `systemQueries`. */
    systemQueries: ISavedQuery[];
    /** The hydrated project record, when `projectRecord` was supplied. */
    projectRecord?: ISingleRecord;
    /** The hydrated source record, when `sourceRecord` was supplied. */
    sourceRecord?: ISingleRecord;
}

/**
 * What the descriptor hands the lookup-many callback: the cell the picker belongs to, plus the two
 * records its query can be scoped by. Pass the whole thing to
 * {@link DataverseLookupManyDataProviderFactory}.
 */
export interface IDataverseLookupManyParameters extends ILookupManyDataProviderParameters {
    /** The hydrated project record, when `projectRecord` was supplied. Reaches the query as `{{ project.* }}`. */
    projectRecord?: ISingleRecord;
    /** The hydrated source record, when `sourceRecord` was supplied. Reaches the query as `{{ currentRecord.* }}`. */
    sourceRecord?: ISingleRecord;
}

/** What {@link IDataverseModules.onGetUserQueriesModule} needs — nothing more. */
export type IDataverseUserQueriesContext = Pick<IDataverseStrategyContext, 'entityName' | 'recordId' | 'userId'>;

/** What {@link IDataverseModules.onGetCustomColumnsModule} needs — nothing more. */
export type IDataverseCustomColumnsContext = Pick<IDataverseStrategyContext, 'entityName' | 'recordId'>;

/** What {@link IDataverseModules.onGetLookupManyModule} needs — nothing more. */
export type IDataverseLookupManyContext = Pick<IDataverseStrategyContext, 'projectRecord' | 'sourceRecord'>;

/**
 * The feature modules a Dataverse grid can run with, one builder per feature. Each takes only the slice
 * of context its own strategy actually reads — never the full {@link IDataverseStrategyContext} — so a
 * module that needs more than another doesn't grow a type every other builder is forced to share. A
 * builder that needs nothing (the customizer and templates, below) takes no parameter at all.
 */
export interface IDataverseModules {
    /**
     * Registering this is what adds *My views*, the save commands and the view manager. Needs the
     * `talxis_userquery` table — and nothing here references it otherwise, keeping it out of bundles that
     * do not use personal views.
     *
     * ```ts
     * onGetUserQueriesModule: (context) => createUserQueryModule({
     *     strategy: new DataverseUserQueryStrategy({
     *         entityName: context.entityName,
     *         recordId: context.recordId,
     *         ownerId: context.userId,
     *     }),
     *     enableQueryManager: true,
     * })
     * ```
     */
    onGetUserQueriesModule?: (context: IDataverseUserQueriesContext) => IUserQueryModule | undefined;
    /**
     * There is no Dataverse template provider yet, so this is the way to bring your own; omit it and
     * template creation stays out of the ribbon. Nothing on the descriptor is relevant to building it.
     *
     * ```ts
     * onGetTemplatesModule: () => createTemplateModule({ provider: new MyTemplateDataProvider() })
     * ```
     */
    onGetTemplatesModule?: () => ITemplateModule | undefined;
    /**
     * Needs the `talxis_attributedefinition` and `talxis_attributevalue` tables. Omit it and custom
     * columns are off, and neither table is read.
     *
     * ```ts
     * onGetCustomColumnsModule: (context) => createCustomColumnsModule({
     *     strategy: new DataverseCustomColumnsStrategy({
     *         entityName: context.entityName,
     *         recordId: context.recordId,
     *     }),
     * })
     * ```
     */
    onGetCustomColumnsModule?: (context: IDataverseCustomColumnsContext) => ICustomColumnsModule | undefined;
    /**
     * Deep-customizes the grid's own AG Grid instance — column definitions, row class rules, one-time
     * init. See [**Customizer**](?path=/story/task-grid-customizations-customizer--overview). Nothing on
     * the descriptor is relevant to building it — your strategy is entirely your own.
     *
     * ```ts
     * onGetGridCustomizerModule: () => createGridCustomizerModule({ strategy: new MyGridCustomizerStrategy() })
     * ```
     */
    onGetGridCustomizerModule?: () => IGridCustomizerModule | undefined;
    /**
     * Feeds the candidates of a lookup-many picker. Which columns *render* as lookup-many is driven by
     * `metadata.LookupMany` on the column itself; this only supplies what feeds them.
     * {@link DataverseLookupManyDataProviderFactory} builds the provider from the column's own `FetchXml`
     * binding — `context.projectRecord` and `context.sourceRecord` are what it needs beyond the cell's
     * own `record`/`column`:
     *
     * ```ts
     * onGetLookupManyModule: (context) => createLookupManyModule({
     *     createDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create({
     *         ...parameters,
     *         projectRecord: context.projectRecord,
     *         sourceRecord: context.sourceRecord,
     *     }),
     * })
     * ```
     */
    onGetLookupManyModule?: (context: IDataverseLookupManyContext) => ILookupManyModule | undefined;
}

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IDataverseTaskStrategyContext extends IDataverseStrategyContext {
    /** The providers and flags the grid built. Forward them to the strategy's second argument. */
    deps: ITaskStrategyDeps;
    /** The `baseFetchXml` from `onInitialize`. The strategy renders its Liquid variables itself. */
    fetchXml: string;
    /** The hydrated project record, when `projectRecord` was supplied. */
    projectRecord?: ISingleRecord;
    /** The hydrated source record, when `sourceRecord` was supplied. */
    sourceRecord?: ISingleRecord;
}

/** What {@link IDataverseTaskGridDescriptorParams.onInitialize} resolves: the data the grid loads with. */
export interface IDataverseTaskGridDescriptorInitializeResult {
    /** FetchXML that drives the initial data load. May use the Liquid template variables. */
    baseFetchXml: string;
    /** Maps logical entity attribute names to the roles expected by TaskGrid (e.g. `statecode` → `stateCode`). */
    fieldMapping: IDataverseFieldMapping;
    /** System (non-deletable) views exposed in the view switcher. At least one is required, and their columns are the grid's column catalogue. */
    systemQueries: ISavedQuery[];
    /** The project these tasks belong to. Injected into Liquid templates and pre-filled on create. */
    projectRecord?: RecordInput;
    /** An additional record exposed to Liquid templates. Its data is propagated into the FetchXML. */
    sourceRecord?: RecordInput;
    /** ID of the currently logged-in user. Pass it on to the user-query strategy to scope personal views. */
    userId?: string;
    /** Feature flags forwarded to the grid. See {@link ITaskGridParameters}. */
    gridParameters?: ITaskGridParameters;
}

/**
 * Constructor parameters for {@link DataverseTaskGridDescriptor}: the required `onInitialize` hook, the
 * container height, and an optional hook per feature.
 *
 * Data comes from `onInitialize`; behaviour is passed here. What a feature hook returns decides whether
 * the feature exists at all — omit it and the feature is off, which is also what keeps the tables it
 * would read (and its code) out of your deployment. The same shape
 * {@link MemoryTaskGridDescriptor} uses.
 */
export interface IDataverseTaskGridDescriptorParams {
    /**
     * Resolves the FetchXML, the field mapping, the system views and the records the query is scoped by.
     * Awaited once, before any strategy or data provider is created, so the work is covered by the
     * grid's loading state.
     */
    onInitialize: () => Promise<IDataverseTaskGridDescriptorInitializeResult>;
    /**
     * Container height. Kept outside `onInitialize` because the skeleton needs it before the data
     * resolves.
     */
    height?: string;
    /**
     * (Optional) Supplies the task strategy — this is where every task-level option goes: the form ids,
     * the delete behaviour, the root task, and the strategy's own `form` hook.
     *
     * ```ts
     * onCreateTaskStrategy: ({ deps, fetchXml, projectRecord, sourceRecord }) => new DataverseTaskStrategy({
     *     onInitialize: async () => ({
     *         fetchXml, projectRecord, sourceRecord,
     *         editFormId, createFormId, bulkEditFormId,
     *         rootTaskId,
     *         isCascadeDeleteEnabled: true,
     *     }),
     * }, deps)
     * ```
     *
     * Omit it and the descriptor builds a plain `DataverseTaskStrategy` over the resolved FetchXML.
     */
    onCreateTaskStrategy?: (context: IDataverseTaskStrategyContext) => ITaskDataProviderStrategy;
    /**
     * (Optional) Supplies the feature modules, one builder function per feature — see
     * {@link IDataverseModules} for what each one does and needs. Omit a key and that feature is off,
     * which also keeps its code (and whatever table it reads) out of your bundle.
     *
     * Every builder is called after `onInitialize` has resolved, so a builder that does take context
     * (`entityName`, for instance) always sees a value derived from the loaded `baseFetchXml`, never a
     * stale or empty one.
     */
    modules?: IDataverseModules;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} implementation for the Dataverse / Talxis platform.
 *
 * Wires together the required strategies — task CRUD, saved queries. The data is resolved by
 * `onInitialize`, the behaviour passed alongside it. Pass an instance to
 * `TaskGridDatasetControlFactory.createInstance`.
 *
 * @example
 * ```ts
 * const descriptor = new DataverseTaskGridDescriptor({
 *   height: '600px',
 *   onInitialize: async () => ({
 *     baseFetchXml: myFetchXml,
 *     fieldMapping: { parentId: 'talxis_parenttaskid', subject: 'subject', stackRank: 'talxis_stackrank' },
 *     systemQueries: [myDefaultView],
 *   }),
 *   //features are opt-in: registering the module is what turns one on
 *   modules: {
 *     onGetUserQueriesModule: context => createUserQueryModule({ strategy: new DataverseUserQueryStrategy({ entityName: context.entityName }) }),
 *   },
 * });
 * const control = await TaskGridDatasetControlFactory.createInstance({ taskGridDescriptor: descriptor, ... });
 * ```
 */
export class DataverseTaskGridDescriptor implements ITaskGridDescriptor {
    private _params: IDataverseTaskGridDescriptorParams;
    private _initialized!: IDataverseTaskGridDescriptorInitializeResult;
    private _fetchXml!: string;
    private _systemQueries: ISavedQuery[] = [];
    private _taskEntityName!: string;
    private _projectRecord?: ISingleRecord;
    private _sourceRecord?: ISingleRecord;

    /** @param params — see {@link IDataverseTaskGridDescriptorParams} for full documentation of each option. */
    constructor(params: IDataverseTaskGridDescriptorParams) {
        this._params = params;
    }

    /** Resolves the project entity reference (fetches display name when not supplied). Called once by the factory before any strategy is created. */
    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    public async onLoadDependencies(): Promise<void> {
        const initialized = await this._params.onInitialize();
        this._initialized = initialized;
        this._systemQueries = initialized.systemQueries;
        this._fetchXml = initialized.baseFetchXml;
        this._taskEntityName = this._getTaskEntityNameFromFetchXml(initialized.baseFetchXml);
        this._projectRecord = await this._getProjectRecord();
        this._sourceRecord = await this._getSourceRecord();
    }

    //needs to be seperate from onGetGridParameters since it is also required for skeleton rendering before the instance is created
    public onGetHeight(): string | undefined {
        return this._params.height;
    }

    /** Returns the field mapping with `stateCode` hard-coded to `"statecode"` (standard Dataverse attribute name). */
    public onGetFieldMapping(): IFieldMapping {
        return {
            ...this._initialized.fieldMapping,
            //dataverse uses this for all entities
            stateCode: 'statecode',
        }
    }

    /** Returns the feature flags supplied at construction time, or an empty object — every flag then defaults to `false`. */
    public onGetGridParameters(): ITaskGridParameters {
        return this._initialized.gridParameters ?? {};
    }

    /**
     * Serves the `systemQueries` supplied at construction time. Personal views come from the
     * user-queries module registered through `modules.onGetUserQueriesModule` — without it they are off
     * and `talxis_userquery` is never read.
     */
    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return {
            onGetSystemQueries: async () => this._systemQueries,
        };
    }

    /**
     * Calls each builder on the `modules` parameter, per {@link IDataverseModules} — each with only the
     * slice of context it declares, or with none at all. An absent builder — which is what omitting the
     * key does — leaves that feature off.
     */
    public onGetModules(): ITaskGridModules {
        const context = this._getStrategyContext();
        const modules = this._params.modules;
        return {
            userQueries: modules?.onGetUserQueriesModule?.(context),
            templates: modules?.onGetTemplatesModule?.(),
            customColumns: modules?.onGetCustomColumnsModule?.(context),
            gridCustomizer: modules?.onGetGridCustomizerModule?.(),
            lookupMany: modules?.onGetLookupManyModule?.(context),
        };
    }

    /**
     * Delegates to the `onCreateTaskStrategy` parameter, falling back to a plain `DataverseTaskStrategy`
     * over the resolved FetchXML. The form ids, delete flags and root task live on that callback.
     */
    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        const context: IDataverseTaskStrategyContext = {
            ...this._getStrategyContext(),
            deps: deps,
            fetchXml: this._fetchXml,
            projectRecord: this._projectRecord,
            sourceRecord: this._sourceRecord,
        };
        return this._params.onCreateTaskStrategy?.(context) ?? new DataverseTaskStrategy({
            onInitialize: async () => ({
                fetchXml: this._fetchXml,
                projectRecord: this._projectRecord,
                sourceRecord: this._sourceRecord,
            }),
        }, deps);
    }

    private async _getProjectRecord(): Promise<ISingleRecord | undefined> {
        const projectRecord = this._initialized.projectRecord;
        if (!projectRecord) return undefined;
        if (isSingleRecord(projectRecord)) {
            return projectRecord;
        }

        const projectId = projectRecord.id;
        const projectEntityName = projectRecord.entityName;
        const metadata = await EntityDefinition.fromEntityName(projectEntityName);
        //@ts-ignore - typings
        const attributes = (await window.Xrm.Utility.getEntityMetadata(projectEntityName, metadata.Attributes.map(attr => attr.LogicalName))).Attributes.get().filter(attr => attr.IsValidForGrid);
        const projectData = await window.Xrm.WebApi.retrieveRecord(projectEntityName, projectId, `?$select=${metadata.PrimaryNameAttribute}`);
        const builder = new RecordBuilder({
            data: projectData,
            entityMetadata: metadata,
            attributes: attributes
        });
        return builder.getRecord();
    }

    private async _getSourceRecord(): Promise<ISingleRecord | undefined> {
        const sourceRecord = this._initialized.sourceRecord;
        if (!sourceRecord) {
            return undefined;
        }
        const sourceRecordId = isSingleRecord(sourceRecord) ? sourceRecord.getRecordId() : sourceRecord.id;
        if (this._projectRecord && this._projectRecord.getRecordId() === sourceRecordId) {
            return this._projectRecord;
        }

        if (isSingleRecord(sourceRecord)) {
            return sourceRecord;
        }
        const result = await window.Xrm.WebApi.retrieveRecord(sourceRecord.entityName, sourceRecord.id);
        const entityMetadata = await EntityDefinition.fromEntityName(sourceRecord.entityName);
        //@ts-ignore - typings
        const attributes = (await window.Xrm.Utility.getEntityMetadata(sourceRecord.entityName, entityMetadata.Attributes.map(attr => attr.LogicalName))).Attributes.get().filter(attr => attr.IsValidForGrid);

        const builder = new RecordBuilder({
            data: result,
            entityMetadata: entityMetadata,
            attributes: attributes
        });

        return builder.getRecord();
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private _getStrategyContext(): IDataverseStrategyContext {
        return {
            entityName: this._taskEntityName,
            recordId: this._projectRecord?.getRecordId(),
            userId: this._initialized.userId,
            systemQueries: this._systemQueries,
            projectRecord: this._projectRecord,
            sourceRecord: this._sourceRecord,
        };
    }

    private _getTaskEntityNameFromFetchXml(fetchXml: string): string {
        const fetchXmlBuilder = FetchXmlBuilder.fetch.fromXml(fetchXml);
        return fetchXmlBuilder.entity.name;
    }

}