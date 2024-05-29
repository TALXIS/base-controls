import { useEffect, useState } from "react";
import { useComponent } from "../../../hooks";
import { StringProps } from "../../../types";
import { IEntity, ILookup, ILookupTranslations } from "../interfaces";
import { lookupTranslations } from "../translations";
import { useFetchXml } from "./useFetchXml";

export const useLookup = (props: ILookup): [
    ComponentFramework.LookupValue[],
    IEntity[],
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
    
    const [entities, setEntities] = useState<IEntity[]>(() => {
        return targets.map(target => {
            return {
                entityName: target,
                selected: targets.length === 1 ? true : false,
                metadata: props.context.utils.getEntityMetadata(target, []) as any,
            }
        })
    });

    const selectedEntity = entities.find(x => x.selected);

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
    const getSearchFetchXml = async (entityName: string, query: string): Promise<string> => {
        const response = (await props.parameters.value.getAllViews(entityName)).find(x => x.isDefault);
        if (!response?.viewId) {
            throw new Error(`Entity ${entityName} does not have a default view id!`);
        }
        let fetchXml = response?.fetchXml
        if(!fetchXml) {
            fetchXml = await getFetchXml(response.viewId)
        }
        return applyLookupQuery(entities.find(x => x.entityName === entityName)!, fetchXml, query);

    }
    const getSearchResults = async (query: string): Promise<ComponentFramework.LookupValue[]> => {
        const fetchXmlMap = new Map<string, Promise<string>>();
        if(selectedEntity) {
            fetchXmlMap.set(selectedEntity.entityName, getSearchFetchXml(selectedEntity.entityName, query))
        }
        else {
            for (const entity of targets) {
                fetchXmlMap.set(entity, getSearchFetchXml(entity, query))
            }
        }
        await Promise.all(fetchXmlMap.values());
        const responsePromiseMap = new Map<string, Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>>()
        for (const [entityName, fetchXml] of fetchXmlMap) {
            responsePromiseMap.set(entityName, context.webAPI.retrieveMultipleRecords(entityName, `?fetchXml=${encodeURIComponent((await fetchXml))}`))
        }
        await Promise.all(responsePromiseMap.values());
        const result: ComponentFramework.LookupValue[] = [];
        for (const [entityName, response] of responsePromiseMap) {
            for (const entity of (await response).entities) {
                const entityMetadata = await entities.find(x => x.entityName === entityName)!.metadata;
                result.push({
                    entityType: entityName,
                    id: entity[entityMetadata.PrimaryIdAttribute],
                    name: entity[entityMetadata.PrimaryNameAttribute]
                });
            }
        }
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