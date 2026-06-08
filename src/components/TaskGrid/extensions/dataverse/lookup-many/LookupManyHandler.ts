import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { IManyToManyRelationship, IRelationship } from "@talxis/client-metadata/dist/interfaces/entity/IEntityDefinition";


/** Supported Dataverse relationship kinds used by the handler. */
enum RelationshipType {
    OneToMany = 0,
    ManyToMany = 1
}

/** Constructor parameters required to resolve relationship metadata. */
interface IManyToManyTestParams {
    /** Parent entity navigation property name that identifies the relationship. */
    navigationPropertyName: string;
    /** Logical name of the source entity for association operations. */
    entityName: string;

    /** Optional custom intersection configuration for non-standard many-to-many persistence. */
    customIntersection?: ICustomIntersection;
}

/** Custom intersection mapping used for manual association/disassociation. */
interface ICustomIntersection {
    /** Navigation property name from intersection entity to related entity. */
    referencingEntityNavigationPropertyName: string;
}

/** Extended entity reference used to carry raw lookup payload and custom intersection ids. */
interface IRelatedEntityReference extends ComponentFramework.EntityReference {
    rawData?: {
        [key: string]: any;
        __intersectionId?: string;
    }
}

/** Contract for a lookup-many relationship handler. */
export interface ILookupManyHandler {
    /** Loads relationship metadata and prepares the handler for usage. */
    init(): Promise<void>;
    /** Returns OData expand segment for the configured relationship. */
    getExpand(select?: string): string;
    //*/ Indicates whether this handler uses a custom intersection entity for association management. */
    isCustomIntersection(): boolean;
    /** Returns cached metadata for the custom intersection entity. Throws if custom intersection is not configured or metadata is unavailable. */
    getCustomIntersectionEntityMetadata: () => Xrm.Metadata.EntityMetadata;
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
    private _customIntersection?: ICustomIntersection;
    private _customIntersectionEntityMetadata?: Xrm.Metadata.EntityMetadata | null;
    private _entityName: string;
    private _navigationPropertyName: string;

    constructor(params: IManyToManyTestParams) {
        this._navigationPropertyName = params.navigationPropertyName;
        this._entityName = params.entityName;
        this._customIntersection = params.customIntersection;
    }

    /** Initializes the handler and caches relationship metadata. */
    public async init() {
        if (this._initialized) return;
        this._relationship = await this._fetchRelationship();
        if(this._customIntersection) {
            this._customIntersectionEntityMetadata = await window.Xrm.Utility.getEntityMetadata(this._getRelatedEntityName());
        }
        this._initialized = true;
    }

    /**
     * Builds an OData expand clause for the configured relationship.
     * @param select Optional comma-separated projection for expanded records.
     */
    public getExpand(select?: string): string {
        if (this.isCustomIntersection()) {
            const intersectionMetadata = this.getCustomIntersectionEntityMetadata();
            const intersectionIdField = intersectionMetadata.PrimaryIdAttribute;
            const relatedNavProp = this._customIntersection!.referencingEntityNavigationPropertyName;
            const expandClause = select ? `($select=${select})` : '';
            return `${this._navigationPropertyName}($select=${intersectionIdField};$expand=${relatedNavProp}${expandClause})`;
        }
        const relationship = this._getRelationship();
        //@ts-ignore - typings
        if (relationship.RelationshipType === RelationshipType.OneToMany) {
            return `${(relationship as IRelationship).ReferencedEntityNavigationPropertyName}${select ? `($select=${select})` : ''}`;
        }
        else {
            const rel = relationship as IManyToManyRelationship;
            return `${this._navigationPropertyName}${select ? `($select=${select})` : ''}`;
        }
    }

    public isCustomIntersection(): boolean {
        return !!this._customIntersection;
    }

    public getCustomIntersectionEntityMetadata(): Xrm.Metadata.EntityMetadata {
        if (!this._customIntersection) {
            throw new Error('Custom intersection configuration is missing. Please provide referencingEntityNavigationPropertyName in the constructor parameters.');
        }
        if (!this._customIntersectionEntityMetadata) {
            throw new Error('Custom intersection metadata is not available. Ensure init() was called before metadata access.');
        }
        return this._customIntersectionEntityMetadata;
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

        const deleteResult = await this._executeAssociation('Disassociate', recordId, toRemove);
        const addResult = await this._executeAssociation('Associate', recordId, toAdd);
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

    private async _executeAssociation(operationName: 'Associate' | 'Disassociate', parentId: string, relatedRecords: IRelatedEntityReference[]): Promise<IRecordSaveOperationResult | null> {
        if (relatedRecords.length === 0) {
            return null;
        }
        try {
            if (operationName === 'Disassociate') {
                if (this._customIntersection) {
                    await this._deleteCustomIntersectionRecord(parentId, relatedRecords);
                }
                else {
                    await Promise.all(relatedRecords.map(record =>
                        window.Xrm.WebApi.online.execute({
                            ...this._buildBaseRequest(operationName, parentId),
                            relatedEntityId: record.id.guid,
                        })
                    ));
                }
            }
            else {
                if (this._customIntersection) {
                    await Promise.all(relatedRecords.map(record => this._createCustomIntersectionRecord(parentId, record)));
                }
                else {
                    await window.Xrm.WebApi.online.execute({
                        ...this._buildBaseRequest(operationName, parentId),
                        relatedEntities: relatedRecords.map(record => ({ id: record.id.guid, entityType: this._getRelatedEntityName() })),
                    });
                }
            }
            return { recordId: parentId, success: true, fields: [] };
        }
        catch (err: any) {
            return { recordId: parentId, success: false, fields: [], errors: [{ message: err.message }] };
        }
    }

    private async _createCustomIntersectionRecord(parentId: string, relatedRecord: IRelatedEntityReference): Promise<void> {
        const parentEntityMetadata = await window.Xrm.Utility.getEntityMetadata(this._entityName);
        const intersectionEntityMetadata: any = this.getCustomIntersectionEntityMetadata();
        const relatedEntityRelationship = intersectionEntityMetadata.ManyToOneRelationships.getAll().find((rel: any) => rel.ReferencingEntityNavigationPropertyName === this._getCustomIntersection().referencingEntityNavigationPropertyName);
        const relatedEntityMetadata = await window.Xrm.Utility.getEntityMetadata(relatedEntityRelationship.ReferencedEntity);

        const payload = {
            //@ts-ignore - typings
            [`${this._getRelationship().ReferencingEntityNavigationPropertyName}@odata.bind`]: `${parentEntityMetadata.EntitySetName}(${parentId})`,
            [`${this._getCustomIntersection().referencingEntityNavigationPropertyName}@odata.bind`]: `${relatedEntityMetadata.EntitySetName}(${relatedRecord.id.guid})`
        }
        const result = await window.Xrm.WebApi.createRecord(intersectionEntityMetadata.LogicalName, payload);
        //this should be done through setValue
        relatedRecord.rawData = {
            ...relatedRecord.rawData,
            __intersectionId: result.id
        }

    }

    private async _deleteCustomIntersectionRecord(parentId: string, relatedRecords: IRelatedEntityReference[]): Promise<void> {
        const intersectionEntityMetadata: any = this.getCustomIntersectionEntityMetadata();
        await Promise.all(relatedRecords.map(async record => {
            const intersectionId = record.rawData?.__intersectionId;
            if (!intersectionId) {
                throw new Error('Missing intersection record ID for disassociation. Cannot proceed with custom intersection deletion.');
            }
            await window.Xrm.WebApi.deleteRecord(intersectionEntityMetadata.LogicalName, intersectionId);
        }))
    }

    private _getCustomIntersection() {
        if (!this._customIntersection) {
            throw new Error('Custom intersection configuration is missing. Please provide referencingEntityNavigationPropertyName in the constructor parameters.');
        }
        return this._customIntersection;
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