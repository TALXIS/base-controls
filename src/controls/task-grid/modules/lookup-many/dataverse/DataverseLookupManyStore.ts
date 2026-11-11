import { FetchXmlDataProvider, IDataProvider, IEntityReference, IRawRecord } from "@talxis/client-libraries";
import { Liquid } from "liquidjs";
import type { IPcfContext } from "@pcf/interfaces";
import type { ITaskDataProvider } from "../../../runtime/provider";
import type { ITaskRuntime } from "../../../runtime";
import type { IDataverseHostRecord } from "../../../runtime/data-sources/dataverse/DataverseTaskStore";
import type { ILookupManyColumn, ILookupManyOptionsParameters, ILookupManyStore } from "../LookupMany";
import { retrieveInBatches } from "../../dataverse";

/** One Dataverse lookup-many column with the relationship it is reached through. */
export interface IDataverseLookupManyColumn extends ILookupManyColumn {
    /** Either side's navigation property of the 1:N or N:N relationship. */
    navigationPropertyName: string;
    /** The related records' columns to read, comma separated. */
    select?: string;
    /** Set when the relationship goes through an intersection entity of your own. */
    customIntersection?: {
        /** The intersection entity's navigation property to the related record. */
        navigationPropertyName: string;
    };
    /** Liquid FetchXML over `task`, `project` and `hostRecord` for the records offered. */
    fetchXml: string;
}

export interface IDataverseLookupManyStoreParameters {
    taskRuntime: ITaskRuntime;
    /** The lookup-many columns by name. */
    columns: { [columnName: string]: IDataverseLookupManyColumn };
    /** The record the grid sits on, as `hostRecord` in a column's FetchXML. */
    hostRecord?: IDataverseHostRecord;
}

type Reference = IEntityReference<IRawRecord & { __intersectionId?: string }>;

interface IResolvedColumn {
    columnName: string;
    settings: IDataverseLookupManyColumn;
    /** The task's collection the related records come back in. */
    expandName: string;
    relationshipSchemaName: string;
    /** The entity associated with the task, the intersection one for a custom intersection. */
    associatedEntityName: string;
    target: { primaryIdAttribute: string; primaryNameAttribute: string };
    intersection?: { entityName: string; primaryIdAttribute: string; taskNavigationPropertyName: string };
}

const ONE_TO_MANY = 0;
const MANY_TO_MANY = 1;

//the values land inside FetchXML attributes
const LIQUID = new Liquid({ outputEscape: 'escape' });

/** Loads and saves the lookup-many columns of Dataverse tasks through their relationships. */
export class DataverseLookupManyStore implements ILookupManyStore<IDataverseLookupManyColumn> {
    private _taskRuntime: ITaskRuntime;
    private _columns: { [columnName: string]: IDataverseLookupManyColumn };
    private _hostRecord?: IDataverseHostRecord;
    private _resolvedColumns = new Map<string, IResolvedColumn>();
    //what was last loaded or saved by task id and column name
    private _savedValues = new Map<string, Reference[]>();

    constructor(parameters: IDataverseLookupManyStoreParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._columns = parameters.columns;
        this._hostRecord = parameters.hostRecord;
    }

    public async loadValues(taskIds: string[]): Promise<Map<string, { [columnName: string]: Reference[] }>> {
        const values = new Map<string, { [columnName: string]: Reference[] }>();
        const columnNames = Object.keys(this._columns);
        if (columnNames.length === 0 || taskIds.length === 0) {
            return values;
        }
        const resolved = await Promise.all(columnNames.map(columnName => this._resolve(columnName)));
        const primaryIdAttribute = this._provider.getMetadata().PrimaryIdAttribute!;
        for (const entity of await this._getTasks(taskIds, primaryIdAttribute, resolved)) {
            const taskId = entity[primaryIdAttribute];
            const taskValues: { [columnName: string]: Reference[] } = {};
            for (const resolvedColumn of resolved) {
                const items: IRawRecord[] = [...entity[resolvedColumn.expandName] ?? [], ...await this._getNextPages(entity[`${resolvedColumn.expandName}@odata.nextLink`])];
                const references = this._toReferences(items, resolvedColumn);
                this._savedValues.set(this._getKey(taskId, resolvedColumn.columnName), references);
                taskValues[resolvedColumn.columnName] = references;
            }
            values.set(taskId, taskValues);
        }
        return values;
    }

    public async saveValue(taskId: string, columnName: string, value: Reference[]): Promise<void> {
        const key = this._getKey(taskId, columnName);
        const previous = this._savedValues.get(key) ?? [];
        const removed = previous.filter(reference => !value.some(kept => kept.id.guid === reference.id.guid));
        const added = value.filter(reference => !previous.some(existing => existing.id.guid === reference.id.guid));
        const resolved = await this._resolve(columnName);
        const saved = new Map(previous.map(reference => [reference.id.guid, reference]));
        await this._disassociate(taskId, removed, resolved, reference => {
            saved.delete(reference.id.guid);
            this._savedValues.set(key, [...saved.values()]);
        });
        await this._associate(taskId, added, resolved, reference => {
            saved.set(reference.id.guid, reference);
            this._savedValues.set(key, [...saved.values()]);
        });
        this._savedValues.set(key, value.map(reference => saved.get(reference.id.guid) ?? reference));
    }

    //a column offers what its FetchXML selects, rendered for the task
    public createOptionsProvider(parameters: ILookupManyOptionsParameters<IDataverseLookupManyColumn>): IDataProvider {
        const { record, settings } = parameters;
        const project = this._taskRuntime.services.get('datasetControl').modules.find('project');
        return new FetchXmlDataProvider({
            fetchXml: LIQUID.parseAndRenderSync(settings.fetchXml, {
                task: record ? { id: record.getRecordId(), ...record.getRawData() } : {},
                project: { id: project?.getId(), ...project?.getData() as object },
                hostRecord: { id: this._hostRecord?.id, entityName: this._hostRecord?.entityName, ...this._hostRecord?.data },
            }),
        });
    }

    private async _getTasks(taskIds: string[], primaryIdAttribute: string, resolved: IResolvedColumn[]): Promise<IRawRecord[]> {
        const expand = resolved.map(resolvedColumn => this._getExpand(resolvedColumn)).join(',');
        return retrieveInBatches(taskIds, async ids => {
            const query = `?$select=${primaryIdAttribute}&$expand=${expand}&$filter=Microsoft.Dynamics.CRM.In(PropertyName='${primaryIdAttribute}', PropertyValues=[${ids}])`;
            const { entities } = await this._pcfContext.webAPI.retrieveMultipleRecords(this._provider.getEntityName(), query);
            return entities;
        });
    }

    private _getExpand(resolvedColumn: IResolvedColumn): string {
        const select = resolvedColumn.settings.select;
        const relatedSelect = select ? `($select=${select})` : '';
        if (resolvedColumn.intersection) {
            const relatedNavigationPropertyName = resolvedColumn.settings.customIntersection!.navigationPropertyName;
            return `${resolvedColumn.expandName}($select=${resolvedColumn.intersection.primaryIdAttribute};$expand=${relatedNavigationPropertyName}${relatedSelect})`;
        }
        return `${resolvedColumn.expandName}${relatedSelect}`;
    }

    //a task with more related records than one page of the expand
    private async _getNextPages(nextLink: string | undefined): Promise<IRawRecord[]> {
        const items: IRawRecord[] = [];
        let url = nextLink;
        while (url) {
            const response = await fetch(url, { headers: { Accept: 'application/json', 'OData-MaxVersion': '4.0', 'OData-Version': '4.0' } });
            if (!response.ok) {
                throw new Error(`Could not load the rest of the related records: ${response.statusText}`);
            }
            const page = await response.json();
            items.push(...page.value);
            url = page['@odata.nextLink'];
        }
        return items;
    }

    private _toReferences(items: IRawRecord[], resolvedColumn: IResolvedColumn): Reference[] {
        const { target, settings } = resolvedColumn;
        const relatedNavigationPropertyName = settings.customIntersection?.navigationPropertyName;
        return items.map(item => {
            const related: IRawRecord = relatedNavigationPropertyName ? item[relatedNavigationPropertyName] ?? {} : item;
            const data = resolvedColumn.intersection ? { ...related, __intersectionId: item[resolvedColumn.intersection.primaryIdAttribute] } : related;
            return { id: { guid: related[target.primaryIdAttribute] }, name: related[target.primaryNameAttribute], etn: settings.entityName, data };
        });
    }

    //the metadata does not change while the mount lasts
    private async _resolve(columnName: string): Promise<IResolvedColumn> {
        const cached = this._resolvedColumns.get(columnName);
        if (cached) {
            return cached;
        }
        const settings = this._columns[columnName];
        const navigationPropertyName = settings.navigationPropertyName;
        const entityName = this._provider.getEntityName();
        const metadata: any = await this._pcfContext.utils.getEntityMetadata(entityName);
        //Dataverse leaves out a kind of relationship the table has none of
        const relationships: any[] = [...metadata.OneToManyRelationships?.getAll() ?? [], ...metadata.ManyToManyRelationships?.getAll() ?? []];
        const relationship = relationships.find(candidate => candidate.RelationshipType === MANY_TO_MANY
            ? candidate.Entity1NavigationPropertyName === navigationPropertyName || candidate.Entity2NavigationPropertyName === navigationPropertyName
            : candidate.ReferencedEntityNavigationPropertyName === navigationPropertyName || candidate.ReferencingEntityNavigationPropertyName === navigationPropertyName);
        if (!relationship) {
            throw new Error(`No relationship of ${entityName} has the navigation property ${navigationPropertyName}.`);
        }
        const isOneToMany = relationship.RelationshipType === ONE_TO_MANY;
        const associatedEntityName = isOneToMany ? relationship.ReferencingEntity : relationship.Entity1LogicalName === entityName ? relationship.Entity2LogicalName : relationship.Entity1LogicalName;
        const targetMetadata: any = await this._pcfContext.utils.getEntityMetadata(settings.entityName);
        const resolved: IResolvedColumn = {
            columnName,
            settings,
            expandName: isOneToMany ? relationship.ReferencedEntityNavigationPropertyName : navigationPropertyName,
            relationshipSchemaName: relationship.SchemaName,
            associatedEntityName,
            target: { primaryIdAttribute: targetMetadata.PrimaryIdAttribute, primaryNameAttribute: targetMetadata.PrimaryNameAttribute },
        };
        if (settings.customIntersection) {
            const intersectionMetadata: any = await this._pcfContext.utils.getEntityMetadata(associatedEntityName);
            resolved.intersection = { entityName: associatedEntityName, primaryIdAttribute: intersectionMetadata.PrimaryIdAttribute, taskNavigationPropertyName: relationship.ReferencingEntityNavigationPropertyName };
        }
        this._resolvedColumns.set(columnName, resolved);
        return resolved;
    }

    private async _associate(taskId: string, references: Reference[], resolved: IResolvedColumn, onAssociated: (reference: Reference) => void): Promise<void> {
        if (references.length === 0) {
            return;
        }
        if (resolved.intersection) {
            await Promise.all(references.map(async reference => onAssociated(await this._createIntersection(taskId, reference, resolved))));
            return;
        }
        await this._execute('Associate', taskId, resolved, { relatedEntities: references.map(reference => ({ id: reference.id.guid, entityType: resolved.associatedEntityName })) });
        references.forEach(onAssociated);
    }

    private async _disassociate(taskId: string, references: Reference[], resolved: IResolvedColumn, onDisassociated: (reference: Reference) => void): Promise<void> {
        if (resolved.intersection) {
            await Promise.all(references.map(async reference => {
                const intersectionId = reference.data?.__intersectionId;
                if (!intersectionId) {
                    throw new Error(`${reference.name} has no intersection record to delete.`);
                }
                await this._pcfContext.webAPI.deleteRecord(resolved.intersection!.entityName, intersectionId);
                onDisassociated(reference);
            }));
            return;
        }
        await Promise.all(references.map(async reference => {
            await this._execute('Disassociate', taskId, resolved, { relatedEntityId: reference.id.guid });
            onDisassociated(reference);
        }));
    }

    private async _createIntersection(taskId: string, reference: Reference, resolved: IResolvedColumn): Promise<Reference> {
        const intersection = resolved.intersection!;
        const relatedNavigationPropertyName = resolved.settings.customIntersection!.navigationPropertyName;
        const [taskMetadata, relatedMetadata]: any[] = await Promise.all([this._pcfContext.utils.getEntityMetadata(this._provider.getEntityName()), this._pcfContext.utils.getEntityMetadata(reference.etn!)]);
        const created = await this._pcfContext.webAPI.createRecord(intersection.entityName, {
            [`${intersection.taskNavigationPropertyName}@odata.bind`]: `/${taskMetadata.EntitySetName}(${taskId})`,
            [`${relatedNavigationPropertyName}@odata.bind`]: `/${relatedMetadata.EntitySetName}(${reference.id.guid})`,
        });
        return { ...reference, data: { ...reference.data, __intersectionId: created.id } };
    }

    //the PCF Web API has no execute
    private async _execute(operationName: 'Associate' | 'Disassociate', taskId: string, resolved: IResolvedColumn, request: object): Promise<void> {
        await window.Xrm.WebApi.online.execute({
            getMetadata: () => ({ operationType: 2, operationName, parameterTypes: {} }),
            target: { id: taskId, entityType: this._provider.getEntityName() },
            relationship: resolved.relationshipSchemaName,
            ...request,
        });
    }

    private get _provider(): ITaskDataProvider {
        return this._taskRuntime.getProvider();
    }

    private get _pcfContext(): IPcfContext {
        return this._taskRuntime.services.get('pcfContext');
    }

    private _getKey(taskId: string, columnName: string): string {
        return `${taskId}_${columnName}`;
    }
}
