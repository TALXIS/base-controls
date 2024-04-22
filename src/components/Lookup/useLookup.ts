import { useEffect, useState } from "react";
import { ILookup } from "./interfaces";

interface IEntity {
    entityName: string;
    selected: boolean;
    metadata: {
        [key: string]: any;
    }
}

export const useLookup = (props: ILookup): [
    IEntity[] | null
] => {
    const targets = props.parameters.value.attributes.Targets;
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
                metadata: await props.context.utils.getEntityMetadata(target, []),
            })
        }
        setEntities(_entities);
    };

    return [entities];
};