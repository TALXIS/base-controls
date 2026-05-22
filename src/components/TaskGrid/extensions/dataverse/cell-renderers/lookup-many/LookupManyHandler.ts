import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { IManyToManyRelationship, IRelationship } from "@talxis/client-metadata/dist/interfaces/entity/IEntityDefinition";


/** Supported Dataverse relationship kinds used by the handler. */
enum RelationshipType {
    OneToMany = 0,
    ManyToMany = 1
}

/** Suffix used for lookup-many task grid stub columns. */
export const LOOKUP_MANY_COLUMN_NAME_SUFFIX = '_stub';

/** Constructor parameters required to resolve relationship metadata. */
interface IManyToManyTestParams {
    /** Parent entity navigation property name that identifies the relationship. */
    navigationPropertyName: string;
    /** Logical name of the source entity for association operations. */
    entityName: string;
}

/** Contract for a lookup-many relationship handler. */
export interface ILookupManyHandler {
    /** Loads relationship metadata and prepares the handler for usage. */
    init(): Promise<void>;
    /** Returns OData expand segment for the configured relationship. */
    getExpand(select?: string): string;
    /** Saves lookup-many association changes for a record. */
    saveRecord(record: IRecord, lookupManyColName: string): Promise<IRecordSaveOperationResult>;
}


/**
 * Handles metadata resolution and associate/disassociate operations
 * for lookup-many fields in task grid records.
 */
export class LookupManyHandler implements ILookupManyHandler {
    private _relationship?: IRelationship | IManyToManyRelationship;
    private _initialized: boolean = false;
    private _entityName: string;
    private _navigationPropertyName: string;

    constructor(params: IManyToManyTestParams) {
        this._navigationPropertyName = params.navigationPropertyName;
        this._entityName = params.entityName;
    }

    /** Initializes the handler and caches relationship metadata. */
    public async init() {
        if (this._initialized) return;
        this._relationship = await this._fetchRelationship();
        this._initialized = true;
    }

    /**
     * Builds an OData expand clause for the configured relationship.
     * @param select Optional comma-separated projection for expanded records.
     */
    public getExpand(select?: string): string {
        const relationship = this._getRelationship();
        //@ts-ignore - typings
        if (relationship.RelationshipType === RelationshipType.OneToMany) {
            return `${(relationship as IRelationship).ReferencedEntityNavigationPropertyName}${select ? `($select=${select})` : ''}`;
        }
        else {
            const rel = relationship as IManyToManyRelationship;
            return `${rel.Entity1NavigationPropertyName}${select ? `($select=${select})` : ''}`;
        }
    }

    /**
     * Persists association changes by comparing current values with original values.
     * @param record Record being saved.
     * @param lookupManyColName Logical column name for the lookup-many field.
     */
    public async saveRecord(record: IRecord, lookupManyColName: string): Promise<IRecordSaveOperationResult> {
        const recordId = record.getRecordId();
        const newValue = record.getValue(lookupManyColName) ?? [];
        //@ts-ignore - typings
        const previousValue = record.getField(lookupManyColName)._originalValue ?? [];

        const toAdd: ComponentFramework.EntityReference[] = newValue.filter((newValue: ComponentFramework.EntityReference) =>
            !previousValue.some((origValue: ComponentFramework.EntityReference) => origValue.id.guid === newValue.id.guid)
        );
        const toRemove: ComponentFramework.EntityReference[] = previousValue.filter((origValue: ComponentFramework.EntityReference) =>
            !newValue.some((newValue: ComponentFramework.EntityReference) => newValue.id.guid === origValue.id.guid)
        );
        if (toAdd.length === 0 && toRemove.length === 0) {
            return {
                success: true,
                recordId: recordId,
                fields: [],
            }
        }

        const deleteResult = await this._executeAssociation('Disassociate', recordId, toRemove.map(a => a.id.guid));
        const addResult = await this._executeAssociation('Associate', recordId, toAdd.map(a => a.id.guid));
        const success = (deleteResult?.success ?? true) && (addResult?.success ?? true);
        const errors = [...(deleteResult?.errors ?? []), ...(addResult?.errors ?? [])];

        return {
            success,
            recordId: recordId,
            fields: [lookupManyColName],
            errors
        };

    }

    private _getRelationship(): IRelationship | IManyToManyRelationship {
        if (!this._relationship) {
            throw new Error('Relationship not loaded. Have you called init()?');
        }
        return this._relationship;
    }

    private async _fetchRelationship(): Promise<IRelationship | IManyToManyRelationship> {
        const metadata: any = await window.Xrm.Utility.getEntityMetadata(this._entityName);
        const relationships: (IRelationship | IManyToManyRelationship)[] = [...metadata.OneToManyRelationships.getAll(), ...metadata.ManyToManyRelationships.getAll()];
        const relationship = relationships.find(rel => {
            //@ts-ignore - typings
            if (rel.RelationshipType === RelationshipType.ManyToMany) {
                const m2m = rel as IManyToManyRelationship;
                return m2m.Entity1NavigationPropertyName === this._navigationPropertyName ||
                       m2m.Entity2NavigationPropertyName === this._navigationPropertyName;
            }
            const o2m = rel as IRelationship;
            return o2m.ReferencedEntityNavigationPropertyName === this._navigationPropertyName ||
                   o2m.ReferencingEntityNavigationPropertyName === this._navigationPropertyName;

        });
        if (!relationship) {
            throw new Error(`Could not find navigation property name ${this._navigationPropertyName} on ${metadata.LogicalName}`);
        }
        return relationship;
    }

    private async _executeAssociation(operationName: 'Associate' | 'Disassociate', parentId: string, recordIds: string[]): Promise<IRecordSaveOperationResult | null> {
        if (recordIds.length === 0) {
            return null;
        }
        try {
            if (operationName === 'Disassociate') {
                await Promise.all(recordIds.map(id =>
                    window.Xrm.WebApi.online.execute({
                        ...this._buildBaseRequest(operationName, parentId),
                        relatedEntityId: id,
                    })
                ));
            }
            else {
                await window.Xrm.WebApi.online.execute({
                    ...this._buildBaseRequest(operationName, parentId),
                    relatedEntities: recordIds.map(id => ({ id, entityType: this._getRelatedEntityName() })),
                });
            }
            return { recordId: parentId, success: true, fields: [] };
        }
        catch (err: any) {
            return { recordId: parentId, success: false, fields: [], errors: [{ message: err.message }] };
        }
    }

    private _buildBaseRequest(operationName: 'Associate' | 'Disassociate', parentId: string) {
        return {
            getMetadata: () => ({
                operationType: 2,
                operationName,
                parameterTypes: {},
            }),
            target: { id: parentId, entityType: this._entityName },
            relationship: this._getRelationship().SchemaName,
        };
    }

    private _getRelatedEntityName(): string {
        const relationship = this._getRelationship();
        //@ts-ignore - typings
        if (relationship.RelationshipType === RelationshipType.ManyToMany) {
            const rel = relationship as IManyToManyRelationship;
            const isEntity1Source = rel.Entity1LogicalName === this._entityName;
            return isEntity1Source ? rel.Entity2LogicalName : rel.Entity1LogicalName;
        }
        else {
            return (relationship as IRelationship).ReferencingEntity;
        }
    }

}