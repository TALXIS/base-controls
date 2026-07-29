
//@ts-nocheck - typescript
import { ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react";
import { CommandBarButton } from "@fluentui/react";
import { IEntity, ILookupTranslations } from "../interfaces";
import { getLookupStyles } from "../styles";
import { useLoadedEntities } from "../hooks/useLoadedEntities";
import React from 'react';

type ILabelProps<T> = {
    [Property in keyof T]: (variables?: any) => string;
};

interface IRecordCreator {
    labels: Required<ILabelProps<ILookupTranslations>>,
    entities: IEntity[];
    onCreateRecord: (entityName: string) => void;
}

export const RecordCreator = (props: IRecordCreator) => {
    const {labels, entities, onCreateRecord} = {...props};
    const [loadedEntities] = useLoadedEntities(entities);
    const theme = useTheme();
    const styles = getLookupStyles(theme, 0)
    const selectedEntity = entities.find(x => x.selected);

    return (
        <CommandBarButton
            className={styles.createRecordBtn}
            iconProps={{
                iconName: 'Add'
            }}
            onClick={selectedEntity ? () => onCreateRecord(selectedEntity.entityName) : undefined}
            menuProps={!selectedEntity ? {
                calloutProps: {
                    coverTarget: false  
                },
                isBeakVisible: true,
                items: loadedEntities ? (() => {
                    const items: IContextualMenuItem[] = [{
                        key: 'header',
                        itemType: ContextualMenuItemType.Header,
                        text: 'Vyberte tabulku'
                       }]
                       return [...items, ...loadedEntities.map(entity => {
                           return {
                               key: entity.entityName,
                               text: entity.metadata.DisplayName,
                               onClick: () => onCreateRecord(entity.entityName)
                           }
                       })];
                })() : []
            }: undefined} 
            text={labels.newRecord()} />
    )
}