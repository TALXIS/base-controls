import { useEffect, useState } from "react";
import { IEntity, IMetadata } from "../interfaces";

interface ILoadedEntity extends Omit<IEntity, 'metadata'> {
    metadata: IMetadata
}

export const useLoadedEntities = (entities: IEntity[]): [ILoadedEntity[] | null] => {
    const [loadedEntities, setLoadedEntities] = useState<ILoadedEntity[] | null>(null);
    useEffect(() => {
        (async () => {
            setLoadedEntities(await Promise.all(entities.map(async entity => {
                return {
                    entityName: entity.entityName,
                    selected: entity.selected,
                    metadata: await entity.metadata
                }
            })))
        })();
    }, [entities]);

    return [loadedEntities]
}