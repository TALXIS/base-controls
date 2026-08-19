import { FetchXmlBuilder, IDataProvider, ISingleRecord, RecordBuilder } from "@talxis/client-libraries";
import { ICustomColumnsStrategy, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, ITemplateDataProvider, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid";
import { DataverseTaskStrategy } from "./DataverseTaskStrategy";
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
 * What the descriptor hands the lookup-many callback: the cell the picker belongs to, plus everything
 * the descriptor resolved. Pass the whole thing to {@link DataverseLookupManyDataProviderFactory}.
 */
export interface IDataverseLookupManyParameters extends ILookupManyDataProviderParameters, IDataverseStrategyContext {
}

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IDataverseTaskStrategyContext extends IDataverseStrategyContext {
    /** The providers and flags the grid built. Forward them to the strategy's second argument. */
    deps: ITaskStrategyDeps;
    /** The `baseFetchXml` from `onInitialize`. The strategy renders its Liquid variables itself. */
    fetchXml: string;
}

/** Everything `onInitialize` resolves — the data and the options both. */
export interface IDataverseTaskGridDescriptorParams {
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
     * (Optional) Supplies the personal-views implementation. System views always come from
     * `systemQueries`; this is what adds *My views*, the save commands and the view manager:
     *
     * ```ts
     * onCreateUserQueryStrategy: (context) => new DataverseUserQueryStrategy({
     *     entityName: context.entityName,
     *     recordId: context.recordId,
     *     ownerId: context.userId,
     * })
     * ```
     *
     * `DataverseUserQueryStrategy` needs the `talxis_userquery` table, so wiring it is also the
     * statement that the environment has it. Nothing here references it otherwise, which keeps it out
     * of bundles that do not use personal views.
     *
     * The feature callbacks all work that way, and all of them receive what the descriptor resolved.
     */
    onCreateUserQueryStrategy?: (context: IDataverseStrategyContext) => IUserQueryStrategy | undefined;
    /**
     * (Optional) Supplies the template data provider. There is no Dataverse implementation yet, so this
     * is the way to bring your own; omit it and template creation stays out of the ribbon.
     */
    onCreateTemplateDataProvider?: (context: IDataverseStrategyContext) => ITemplateDataProvider | undefined;
    /**
     * (Optional) Supplies the custom-columns strategy — `DataverseCustomColumnsStrategy` needs the
     * `talxis_attributedefinition` and `talxis_attributevalue` tables. Omit it and custom columns are
     * off, and neither table is read.
     */
    onCreateCustomColumnsStrategy?: (context: IDataverseStrategyContext) => ICustomColumnsStrategy | undefined;
    /**
     * (Optional) Supplies the candidates of a lookup-many picker. Which columns *render* as lookup-many
     * is driven by `metadata.LookupMany` on the column itself; this is what feeds them, and
     * {@link DataverseLookupManyDataProviderFactory} builds the provider from the column's own
     * `FetchXml` binding:
     *
     * ```ts
     * onCreateLookupManyDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create(parameters),
     * ```
     */
    onCreateLookupManyDataProvider?: (parameters: IDataverseLookupManyParameters) => IDataProvider | undefined;
    /**
     * (Optional) Supplies a strategy for deep customization of AG Grid column definitions, cell
     * renderers, editors and row class rules. Lookup-many columns are fed by the callback above, so this
     * is only needed for customizations of your own.
     */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} implementation for the Dataverse / Talxis platform.
 *
 * Wires together all required strategies — task CRUD, saved queries, grid customization — from
 * a single constructor parameter object. Pass an instance to `TaskGridDatasetControlFactory.createInstance`.
 *
 * @example
 * ```ts
 * const descriptor = new DataverseTaskGridDescriptor({
 *   baseFetchXml: myFetchXml,
 *   fieldMapping: { parentId: 'talxis_parenttaskid', subject: 'subject', stackRank: 'talxis_stackrank' },
 *   systemQueries: [myDefaultView],
 * });
 * const control = await TaskGridDatasetControlFactory.createInstance({ taskGridDescriptor: descriptor, ... });
 * ```
 */
export class DataverseTaskGridDescriptor implements ITaskGridDescriptor {
    private _params!: IDataverseTaskGridDescriptorParams;
    private _height?: string;
    private _onInitialize: () => Promise<IDataverseTaskGridDescriptorParams>;
    private _fetchXml!: string;
    private _systemQueries: ISavedQuery[] = [];
    private _taskEntityName!: string;
    private _projectRecord?: ISingleRecord;
    private _sourceRecord?: ISingleRecord;

    /** @param params — see {@link IDataverseTaskGridDescriptorParams} for full documentation of each option. */
    constructor(params: { onInitialize: () => Promise<IDataverseTaskGridDescriptorParams>; height?: string }) {
        this._onInitialize = params.onInitialize;
        this._height = params.height;
    }

    /** Resolves the project entity reference (fetches display name when not supplied). Called once by the factory before any strategy is created. */
    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    public async onLoadDependencies(): Promise<void> {
        const params = await this._onInitialize();
        this._params = params;
        this._systemQueries = params.systemQueries;
        this._fetchXml = params.baseFetchXml;
        this._taskEntityName = this._getTaskEntityNameFromFetchXml(params.baseFetchXml);
        this._projectRecord = await this._getProjectRecord();
        this._sourceRecord = await this._getSourceRecord();
    }

    //needs to be seperate from onGetGridParameters since it is also required for skeleton rendering before the instance is created
    public onGetHeight(): string | undefined {
        return this._height;
    }

    /** Returns the field mapping with `stateCode` hard-coded to `"statecode"` (standard Dataverse attribute name). */
    public onGetFieldMapping(): IFieldMapping {
        return {
            ...this._params.fieldMapping,
            //dataverse uses this for all entities
            stateCode: 'statecode',
        }
    }

    /** Returns the feature flags supplied at construction time, or an empty object — every flag then defaults to `false`. */
    public onGetGridParameters(): ITaskGridParameters {
        return this._params.gridParameters ?? {};
    }

    /**
     * Serves the `systemQueries` supplied at construction time. Personal views come from the
     * `onCreateUserQueryStrategy` parameter — without it they are off and `talxis_userquery` is never
     * read.
     */
    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return {
            onGetSystemQueries: async () => this._systemQueries,
        };
    }

    /**
     * Delegates to the `onCreateUserQueryStrategy` parameter. Returning `undefined` — which is what
     * omitting the parameter does — leaves personal views off.
     */
    public onCreateUserQueryStrategy(): IUserQueryStrategy | undefined {
        return this._params.onCreateUserQueryStrategy?.(this._getStrategyContext());
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
        };
        return this._params.onCreateTaskStrategy?.(context) ?? new DataverseTaskStrategy({
            onInitialize: async () => ({
                fetchXml: this._fetchXml,
                projectRecord: this._projectRecord,
                sourceRecord: this._sourceRecord,
            }),
        }, deps);
    }
    /** Delegates to the `onCreateTemplateDataProvider` parameter. Templates are off without it. */
    public onCreateTemplateDataProvider(): ITemplateDataProvider | undefined {
        return this._params.onCreateTemplateDataProvider?.(this._getStrategyContext());
    }

    /** Delegates to the `onCreateCustomColumnsStrategy` parameter. Custom columns are off without it. */
    public onCreateCustomColumnsStrategy(): ICustomColumnsStrategy | undefined {
        return this._params.onCreateCustomColumnsStrategy?.(this._getStrategyContext());
    }

    /** Delegates to the `onCreateGridCustomizerStrategy` parameter. */
    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy | undefined {
        return this._params.onCreateGridCustomizerStrategy?.();
    }

    /** Delegates to the `onCreateLookupManyDataProvider` parameter. */
    public onCreateLookupManyDataProvider(parameters: ILookupManyDataProviderParameters): IDataProvider | undefined {
        return this._params.onCreateLookupManyDataProvider?.({ ...parameters, ...this._getStrategyContext() });
    }

    private async _getProjectRecord(): Promise<ISingleRecord | undefined> {
        const projectRecord = this._params.projectRecord;
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
        const sourceRecord = this._params.sourceRecord;
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
            userId: this._params.userId,
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