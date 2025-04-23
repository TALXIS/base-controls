import { useState } from "react";
import { ITranslation, useControl } from "../../../hooks";
import { IEntity, ILayout, ILookup } from "../interfaces";
import { lookupTranslations } from "../translations";
import { useFetchXml } from "./useFetchXml";
import { ITheme } from "@talxis/react-components";

export const useLookup = (props: ILookup): [
    ComponentFramework.LookupValue[],
    IEntity[],
    ITranslation<Required<ILookup>['translations']>,
    {
        create: (entityName: string) => void,
        select: (record: ComponentFramework.LookupValue[] | undefined) => void,
        deselect: (record: ComponentFramework.LookupValue) => void,
    },
    (entityName: string | null) => void,
    (query: string) => Promise<(ComponentFramework.LookupValue & { entityData: { [key: string]: any }, layout: ILayout })[]>,
    ITheme
] => {

    const targets = props.parameters.value.attributes.Targets;
    const boundValue = props.parameters.value.raw;
    const context = props.context;
    const { labels, theme, onNotifyOutputChanged } = useControl('Lookup', props, lookupTranslations);
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
        onNotifyOutputChanged({
            value: records
        })
    }
    const getSearchFetchXml = async (entityName: string, query: string, viewIdCallBack: (id: string) => void): Promise<string> => {
        const response = (await props.parameters.value.getAllViews(entityName)).find(x => x.isDefault);
        if (!response?.viewId) {
            throw new Error(`Entity ${entityName} does not have a default view id!`);
        }
        viewIdCallBack(response.viewId);
        let fetchXml = response?.fetchXml
        if (!fetchXml) {
            fetchXml = (await getFetchXml(response.viewId)).fetchxml;
        }
        return applyLookupQuery(entities.find(x => x.entityName === entityName)!, fetchXml, query);

    }
    const getSearchResults = async (query: string): Promise<(ComponentFramework.LookupValue & { entityData: { [key: string]: any }, layout: ILayout })[]> => {
        if (props.onSearch) {
            return props.onSearch(selectedEntity ? [selectedEntity?.entityName] : targets, query) as any;
        }
        const fetchXmlMap = new Map<string, Promise<string>>();
        const entityViewIdMap = new Map<string, string>();
        if (selectedEntity) {
            fetchXmlMap.set(selectedEntity.entityName, getSearchFetchXml(selectedEntity.entityName, query, (viewId) => entityViewIdMap.set(selectedEntity.entityName, viewId)))
        }
        else {
            for (const entity of targets) {
                fetchXmlMap.set(entity, getSearchFetchXml(entity, query, (viewId) => entityViewIdMap.set(entity, viewId)))
            }
        }
        await Promise.all(fetchXmlMap.values());
        const responsePromiseMap = new Map<string, Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>>()
        for (const [entityName, fetchXml] of fetchXmlMap) {
            responsePromiseMap.set(entityName, context.webAPI.retrieveMultipleRecords(entityName, `?$top=25&fetchXml=${encodeURIComponent((await fetchXml))}`))
        }
        await Promise.all(responsePromiseMap.values());
        const result: (ComponentFramework.LookupValue & { entityData: { [key: string]: any }, layout: ILayout })[] = [];
        for (const [entityName, response] of responsePromiseMap) {
            const layout: ILayout = JSON.parse((await getFetchXml(entityViewIdMap.get(entityName)!)).layoutjson ?? "{}");
            for (const entity of (await response).entities) {
                const entityMetadata = await entities.find(x => x.entityName === entityName)!.metadata;
                result.push({
                    entityType: entityName,
                    id: entity[entityMetadata.PrimaryIdAttribute],
                    name: entity[layout.Rows?.[0]?.Cells?.[0]?.Name] ?? entity[entityMetadata.PrimaryNameAttribute] ?? labels.noName(),
                    entityData: entity,
                    layout: layout
                });
            }
        }
        return result;
    }

    const createRecord = async (entityName: string) => {
        const formParameters = props.onGetOnCreateFormParameters
            ? (await props.onGetOnCreateFormParameters(entityName))
            : undefined;
        const result = await context.navigation.openForm({
            entityName: entityName,
            useQuickCreateForm: true
        }, formParameters);
        if (!result.savedEntityReference) {
            return;
        }
        onNotifyOutputChanged({
            value: [
                ...boundValue,
                ...result.savedEntityReference
            ]
        });
    }

    const deselectRecord = (record: ComponentFramework.LookupValue) => {
        const map = new Map<string, ComponentFramework.LookupValue>(boundValue.map(value => [value.id, value]));
        map.delete(record.id);
        onNotifyOutputChanged({
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
        getSearchResults,
        theme
    ];
};