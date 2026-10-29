
//@ts-nocheck - typescript
import { ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react";
import { useSurfaceMenuProps } from "@ui";
import { CommandBarButton } from "@fluentui/react";
import { IEntity } from "../interfaces";
import { useLabels } from "@utils";
import { LOOKUP_LABELS } from "../labels";
import { getLookupStyles } from "../styles";
import { useLoadedEntities } from "../hooks/useLoadedEntities";
import React from 'react';

interface IRecordCreator {
    entities: IEntity[];
    onCreateRecord: (entityName: string) => void;
}

export const RecordCreator = (props: IRecordCreator) => {
    const {entities, onCreateRecord} = {...props};
    const labels = useLabels(LOOKUP_LABELS);
    const [loadedEntities] = useLoadedEntities(entities);
    const theme = useTheme();
    const styles = getLookupStyles(theme, 0)
    const selectedEntity = entities.find(x => x.selected);

    const menuProps = useSurfaceMenuProps(!selectedEntity ? {
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
    } : undefined);

    return (
        <CommandBarButton
            className={styles.createRecordBtn}
            iconProps={{
                iconName: 'Add'
            }}
            onClick={selectedEntity ? () => onCreateRecord(selectedEntity.entityName) : undefined}
            menuProps={menuProps}
            text={labels.get('lookup.newRecord')} />
    )
}