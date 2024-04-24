import { useEffect, useState } from "react";
import { useComponent } from "../../../hooks";
import { StringProps } from "../../../types";
import { IEntity, ILookup, ILookupTranslations } from "../interfaces";
import { lookupTranslations } from "../translations";
import { useFetchXml } from "./useFetchXml";

export const useLookup = (props: ILookup): [
    ComponentFramework.LookupValue[],
    IEntity[] | null,
    Required<StringProps<ILookupTranslations>>,
    {
        create: (entityName: string) => void,
        select: (record: ComponentFramework.LookupValue[] | undefined) => void,
        deselect: (record: ComponentFramework.LookupValue) => void,
    },
    (entityName: string | null) => void,
    (query: string) => Promise<ComponentFramework.LookupValue[]>
] => {
    const targets = props.parameters.value.attributes.Targets;
    const boundValue = props.parameters.value.raw;
    const context = props.context;
    const [labels, notifyOutputChanged] = useComponent('Lookup', props, lookupTranslations);
    const [getFetchXml, applyLookupQuery] = useFetchXml(context);
    const [entities, setEntities] = useState<IEntity[] | null>(null);
    const selectedEntity = entities?.find(x => x.selected);

    useEffect(() => {
        init();
    }, []);

    const init = async (): Promise<void> => {
        const _entities: IEntity[] = [];
        for (const target of targets) {
            _entities.push({
                entityName: target,
                selected: false,
                metadata: await props.context.utils.getEntityMetadata(target, []) as any,
            })
        }
        setEntities(_entities);
    };

    const selectEntity = (entityName: string | null) => {
        setEntities([...entities as IEntity[]].map(entity => {
            return {
                entityName: entity.entityName,
                metadata: entity.metadata,
                selected: entity.entityName === entityName
            }
        }))
    }

    const selectRecords = (records: ComponentFramework.LookupValue[] | undefined) => {
        notifyOutputChanged({
            value: records
        })
    }

    const getViewId = async (entityName: string) => {
        //call should be cached
        const viewId = (await props.parameters.value.getAllViews(entityName)).find(x => x.isDefault)?.viewId;
        if (!viewId) {
            throw new Error(`Entity ${entityName} does not have a default view id!`);
        }
        return viewId;
    }

    const getSearchResults = async (query: string): Promise<ComponentFramework.LookupValue[]> => {
        const entityViewIdMap = new Map<string, Promise<string>>();
        if (selectedEntity) {
            entityViewIdMap.set(selectedEntity.entityName, getViewId(selectedEntity.entityName))
        }
        else {
            for (const entity of targets) {
                entityViewIdMap.set(entity, getViewId(entity))
            }
        }
        await Promise.all(entityViewIdMap.values());
        console.log(entityViewIdMap);
        const fetchXmlPromiseMap = new Map<string, Promise<string> | string>()
        for (const [entityName, viewId] of entityViewIdMap) {
            fetchXmlPromiseMap.set(entityName, getFetchXml(await viewId))
        }
        await Promise.all(fetchXmlPromiseMap.values());
        for (const [entityName, fetchXml] of fetchXmlPromiseMap) {
            fetchXmlPromiseMap.set(entityName, applyLookupQuery(entities?.find(x => x.entityName === entityName)!, await fetchXml, query))
        }
        const responsePromiseMap = new Map<string, Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>>()
        for(const [entityName, fetchXml] of fetchXmlPromiseMap) {
            responsePromiseMap.set(entityName, context.webAPI.retrieveMultipleRecords(entityName, `?fetchXml=${await fetchXml}`))
        }
        await Promise.all(responsePromiseMap.values());
        const result: ComponentFramework.LookupValue[] = [];
        for(const [entityName, response] of responsePromiseMap) {
            for(const entity of (await response).entities) {
                const entityMetadata = entities!.find(x => x.entityName === entityName)!.metadata;
                result.push({
                    entityType: entityName,
                    id: entity[entityMetadata.PrimaryIdAttribute],
                    name: entity[entityMetadata.PrimaryNameAttribute]
                });
            }
        }
        console.log(result);
        return result;

    }

    const createRecord = async (entityName: string) => {
        const result = await context.navigation.openForm({
            entityName: entityName,
            useQuickCreateForm: true
        });
        if (!result.savedEntityReference) {
            return;
        }
        notifyOutputChanged({
            value: result.savedEntityReference
        })
    }

    const deselectRecord = (record: ComponentFramework.LookupValue) => {
        const map = new Map<string, ComponentFramework.LookupValue>(boundValue.map(value => [value.id, value]));
        map.delete(record.id);
        notifyOutputChanged({
            value: [...map.values()]
        })
    }

    return [
        boundValue, entities, labels, {
            create: createRecord,
            deselect: deselectRecord,
            select: selectRecords
        },
        selectEntity,
        getSearchResults
    ];
};