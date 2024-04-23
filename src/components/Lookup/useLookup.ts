import { useEffect, useState } from "react";
import { useComponent } from "../../hooks";
import { IEntity, ILookup } from "./interfaces";
import { useFetchXml } from "./useFetchXml";

export const useLookup = (props: ILookup): [
    ComponentFramework.LookupValue[],
    IEntity[] | null,
    {
        create: (entityName: string) => void,
        select: (record: ComponentFramework.LookupValue) => void,
        deselect: (record: ComponentFramework.LookupValue) => void,
    },
    (entityName: string | null) => void,
] => {
    const targets = props.parameters.value.attributes.Targets;
    const boundValue = props.parameters.value.raw;
    const context = props.context;
    const [labels, notifyOutputChanged] = useComponent('Lookup', props);
    const [getFetchXml] = useFetchXml(props.context.webAPI);
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

    const selectRecord = (record: ComponentFramework.LookupValue) => {

    }

    const getViewId = async (entityName: string) => {
        const viewId = (await props.parameters.value.getAllViews(entityName)).find(x => x.isDefault)?.viewId;
        if(!viewId) {
            throw new Error(`Entity ${entityName} does not have a default view id!`);
        }
        return viewId;
    }

    const getSearchResults =  async (query: string) => {
        const viewIds: string[] = [];
        if(selectedEntity) {
            viewIds.push(await getViewId(selectedEntity.entityName))
        }
        else {
            for (const entity of context.parameters.value.attributes.Targets) {
                //TODO: parallel execution
                viewIds.push(await getViewId(entity));
            } 
        }
        const fetchXmlPromiseArray: Promise<ComponentFramework.WebApi.Entity>[] = [];
        for(const viewId of viewIds) {
            fetchXmlPromiseArray.push(context.webAPI.retrieveRecord('savedquery', viewId, '?$select=fetchxml'));
        }

    }

    const createRecord = async (entityName: string) => {
        const result = await context.navigation.openForm({
            entityName: entityName,
            useQuickCreateForm: true
        });
        if(!result.savedEntityReference) {
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
        boundValue, entities, {
            create: createRecord,
            deselect: deselectRecord,
            select: selectRecord
        },
        selectEntity
    ];
};