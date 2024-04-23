import { useEffect, useState } from "react";
import { useComponent } from "../../hooks";
import { IEntity, ILookup } from "./interfaces";

export const useLookup = (props: ILookup): [
    ComponentFramework.LookupValue[],
    IEntity[] | null,
    (entityName: string | null) => void,
    (record: ComponentFramework.LookupValue) => void,
    (record: ComponentFramework.LookupValue) => void
] => {
    const targets = props.parameters.value.attributes.Targets;
    const boundValue = props.parameters.value.raw;
    const [labels, notifyOutputChanged] = useComponent('Lookup', props);
    const [entities, setEntities] = useState<IEntity[] | null>(null);


    useEffect(() => {
        init();
    }, []);

    const init = async (): Promise<void> => {
        const _entities: IEntity[] = [];
        for(const target of targets) {
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

    const removeRecord = (record: ComponentFramework.LookupValue) => {
        const map = new Map<string, ComponentFramework.LookupValue>(boundValue.map(value => [value.id, value]));
        map.delete(record.id);
        notifyOutputChanged({
            value: [...map.values()]
        })
    }

    return [boundValue, entities, selectEntity, selectRecord, removeRecord];
};