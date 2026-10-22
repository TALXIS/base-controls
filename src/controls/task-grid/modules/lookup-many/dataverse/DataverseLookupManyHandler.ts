import type { IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IPcfContext } from "@interfaces";
import type { ITaskColumnHandler, ITaskDataProvider } from "../../../provider";
import type { IDataverseLookupManyColumn } from "./createDataverseLookupManyModule";

export interface IDataverseLookupManyHandlerParameters {
    provider: ITaskDataProvider;
    pcfContext: IPcfContext;
    /** The lookup-many columns by name. */
    columns: { [columnName: string]: IDataverseLookupManyColumn };
}

type Reference = ComponentFramework.EntityReference & { rawData?: IRawRecord & { __intersectionId?: string } };

interface IResolvedColumn {
    column: IColumn;
    settings: IDataverseLookupManyColumn;
    /** The task's collection the related records come back in. */
    expandName: string;
    relationshipSchemaName: string;
    /** The entity associated with the task, the intersection one for a custom intersection. */
    associatedEntityName: string;
    intersection?: { entityName: string; primaryIdAttribute: string; taskNavigationPropertyName: string };
}

const MAX_IDS_PER_REQUEST = 800;
const ONE_TO_MANY = 0;
const MANY_TO_MANY = 1;

/** Loads and saves the lookup-many columns of Dataverse tasks through their relationships. */
export class DataverseLookupManyHandler implements ITaskColumnHandler {
    private _provider: ITaskDataProvider;
    private _pcfContext: IPcfContext;
    private _columns: { [columnName: string]: IDataverseLookupManyColumn };
    private _resolvedColumns = new Map<string, IResolvedColumn>();
    //keyed by task id and column name, what was last loaded or saved, to diff a save against
    private _savedValues = new Map<string, Reference[]>();

    constructor(parameters: IDataverseLookupManyHandlerParameters) {
        this._provider = parameters.provider;
        this._pcfContext = parameters.pcfContext;
        this._columns = parameters.columns;
    }

    public isHandledColumn(columnName: string): boolean {
        return columnName in this._columns;
    }

    public async onLoadValues(taskIds: string[]): Promise<Map<string, IRawRecord>> {
        const values = new Map<string, IRawRecord>();
        const columns = this._provider.getColumns().filter(column => this.isHandledColumn(column.name));
        if (columns.length === 0 || taskIds.length === 0) {
            return values;
        }
        const resolved = await Promise.all(columns.map(column => this._resolve(column)));
        const primaryIdAttribute = this._provider.getMetadata().PrimaryIdAttribute!;
        for (const entity of await this._getTasks(taskIds, primaryIdAttribute, resolved)) {
            const taskId = entity[primaryIdAttribute];
            const taskValues: IRawRecord = {};
            for (const resolvedColumn of resolved) {
                const items: IRawRecord[] = [...entity[resolvedColumn.expandName] ?? [], ...await this._getNextPages(entity[`${resolvedColumn.expandName}@odata.nextLink`])];
                const references = await this._toReferences(items, resolvedColumn);
                this._savedValues.set(this._getKey(taskId, resolvedColumn.column.name), references);
                taskValues[resolvedColumn.column.name] = references;
            }
            values.set(taskId, taskValues);
        }
        return values;
    }

    public async onSaveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult> {
        const taskId = record.getRecordId();
        const key = this._getKey(taskId, column.name);
        const previous = this._savedValues.get(key) ?? [];
        const next = (value as Reference[] | null) ?? [];
        const removed = previous.filter(reference => !next.some(kept => kept.id.guid === reference.id.guid));
        const added = next.filter(reference => !previous.some(existing => existing.id.guid === reference.id.guid));
        try {
            const resolved = await this._resolve(column);
            await this._disassociate(taskId, removed, resolved);
            await this._associate(taskId, added, resolved);
            this._savedValues.set(key, next);
            return { success: true, recordId: taskId, fields: [column.name] };
        }
        catch (error: any) {
            return { success: false, recordId: taskId, fields: [column.name], errors: [{ message: error.message, fieldName: column.name }] };
        }
    }

    private async _getTasks(taskIds: string[], primaryIdAttribute: string, resolved: IResolvedColumn[]): Promise<IRawRecord[]> {
        const expand = resolved.map(resolvedColumn => this._getExpand(resolvedColumn)).join(',');
        const batches: string[][] = [];
        for (let index = 0; index < taskIds.length; index += MAX_IDS_PER_REQUEST) {
            batches.push(taskIds.slice(index, index + MAX_IDS_PER_REQUEST));
        }
        const results = await Promise.all(batches.map(async batch => {
            const ids = batch.map(id => `'${id}'`).join(',');
            const query = `?$select=${primaryIdAttribute}&$expand=${expand}&$filter=Microsoft.Dynamics.CRM.In(PropertyName='${primaryIdAttribute}', PropertyValues=[${ids}])`;
            const { entities } = await this._pcfContext.webAPI.retrieveMultipleRecords(this._provider.getEntityName(), query);
            return entities;
        }));
        return results.flat();
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

    private async _toReferences(items: IRawRecord[], resolvedColumn: IResolvedColumn): Promise<Reference[]> {
        const targetEntityName = resolvedColumn.settings.entityName;
        const metadata: any = await this._pcfContext.utils.getEntityMetadata(targetEntityName);
        const relatedNavigationPropertyName = resolvedColumn.settings.customIntersection?.navigationPropertyName;
        return items.map(item => {
            const related: IRawRecord = relatedNavigationPropertyName ? item[relatedNavigationPropertyName] ?? {} : item;
            const rawData = resolvedColumn.intersection ? { ...related, __intersectionId: item[resolvedColumn.intersection.primaryIdAttribute] } : related;
            return { id: { guid: related[metadata.PrimaryIdAttribute] }, name: related[metadata.PrimaryNameAttribute], etn: targetEntityName, rawData };
        });
    }

    //cached by column, since the metadata does not change while the mount lasts
    private async _resolve(column: IColumn): Promise<IResolvedColumn> {
        const cached = this._resolvedColumns.get(column.name);
        if (cached) {
            return cached;
        }
        const settings = this._columns[column.name];
        const navigationPropertyName = settings.navigationPropertyName;
        const entityName = this._provider.getEntityName();
        const metadata: any = await this._pcfContext.utils.getEntityMetadata(entityName);
        const relationships: any[] = [...metadata.OneToManyRelationships.getAll(), ...metadata.ManyToManyRelationships.getAll()];
        const relationship = relationships.find(candidate => candidate.RelationshipType === MANY_TO_MANY
            ? candidate.Entity1NavigationPropertyName === navigationPropertyName || candidate.Entity2NavigationPropertyName === navigationPropertyName
            : candidate.ReferencedEntityNavigationPropertyName === navigationPropertyName || candidate.ReferencingEntityNavigationPropertyName === navigationPropertyName);
        if (!relationship) {
            throw new Error(`No relationship of ${entityName} has the navigation property ${navigationPropertyName}.`);
        }
        const isOneToMany = relationship.RelationshipType === ONE_TO_MANY;
        const associatedEntityName = isOneToMany ? relationship.ReferencingEntity : relationship.Entity1LogicalName === entityName ? relationship.Entity2LogicalName : relationship.Entity1LogicalName;
        const resolved: IResolvedColumn = {
            column,
            settings,
            expandName: isOneToMany ? relationship.ReferencedEntityNavigationPropertyName : navigationPropertyName,
            relationshipSchemaName: relationship.SchemaName,
            associatedEntityName,
        };
        if (settings.customIntersection) {
            const intersectionMetadata: any = await this._pcfContext.utils.getEntityMetadata(associatedEntityName);
            resolved.intersection = { entityName: associatedEntityName, primaryIdAttribute: intersectionMetadata.PrimaryIdAttribute, taskNavigationPropertyName: relationship.ReferencingEntityNavigationPropertyName };
        }
        this._resolvedColumns.set(column.name, resolved);
        return resolved;
    }

    private async _associate(taskId: string, references: Reference[], resolved: IResolvedColumn): Promise<void> {
        if (references.length === 0) {
            return;
        }
        if (resolved.intersection) {
            await Promise.all(references.map(reference => this._createIntersection(taskId, reference, resolved)));
            return;
        }
        await this._execute('Associate', taskId, resolved, { relatedEntities: references.map(reference => ({ id: reference.id.guid, entityType: resolved.associatedEntityName })) });
    }

    private async _disassociate(taskId: string, references: Reference[], resolved: IResolvedColumn): Promise<void> {
        if (resolved.intersection) {
            await Promise.all(references.map(async reference => {
                const intersectionId = reference.rawData?.__intersectionId;
                if (!intersectionId) {
                    throw new Error(`${reference.name} has no intersection record to delete.`);
                }
                await this._pcfContext.webAPI.deleteRecord(resolved.intersection!.entityName, intersectionId);
            }));
            return;
        }
        await Promise.all(references.map(reference => this._execute('Disassociate', taskId, resolved, { relatedEntityId: reference.id.guid })));
    }

    private async _createIntersection(taskId: string, reference: Reference, resolved: IResolvedColumn): Promise<void> {
        const intersection = resolved.intersection!;
        const relatedNavigationPropertyName = resolved.settings.customIntersection!.navigationPropertyName;
        const [taskMetadata, relatedMetadata]: any[] = await Promise.all([this._pcfContext.utils.getEntityMetadata(this._provider.getEntityName()), this._pcfContext.utils.getEntityMetadata(reference.etn!)]);
        const created = await this._pcfContext.webAPI.createRecord(intersection.entityName, {
            [`${intersection.taskNavigationPropertyName}@odata.bind`]: `/${taskMetadata.EntitySetName}(${taskId})`,
            [`${relatedNavigationPropertyName}@odata.bind`]: `/${relatedMetadata.EntitySetName}(${reference.id.guid})`,
        });
        reference.rawData = { ...reference.rawData, __intersectionId: created.id };
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

    private _getKey(taskId: string, columnName: string): string {
        return `${taskId}_${columnName}`;
    }
}
