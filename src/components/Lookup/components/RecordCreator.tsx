//@ts-nocheck
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, useTheme } from "@fluentui/react";
import { CommandBarButton } from "@fluentui/react/lib/components/Button/CommandBarButton/CommandBarButton";
import React, { useRef, useState } from 'react';
import { IEntity, ILookupTranslations } from "../interfaces";
import { getLookupStyles } from "../styles";
import { StringProps } from '../../../types';

interface IRecordCreator {
    labels: Required<StringProps<ILookupTranslations>>,
    entities: IEntity[];
    onCreateRecord: (entityName: string) => void;
}

export const RecordCreator = (props: IRecordCreator) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const {labels, entities, onCreateRecord} = {...props};
    const theme = useTheme();
    const styles = getLookupStyles(theme)
    const selectedEntity = entities.find(x => x.selected);

    return (
        <CommandBarButton
            className={styles.createRecordBtn}
            iconProps={{
                iconName: 'Add'
            }}
            onClick={selectedEntity ? () => onCreateRecord(selectedEntity.entityName) : () => setShowSelectEntityCallout(true)}
            menuProps={!selectedEntity ? {
                calloutProps: {
                    coverTarget: false  
                },
                isBeakVisible: true,
                items: (() => {
                    const items: IContextualMenuItem[] = [{
                     key: 'header',
                     itemType: ContextualMenuItemType.Header,
                     text: 'Vyberte tabulku'
                    }]
                    return [...items, ...entities.map(entity => {
                        return {
                            key: entity.entityName,
                            text: entity.metadata.DisplayName,
                            onClick: () => onCreateRecord(entity.entityName)
                        }
                    })];
                })()
            }: undefined} 
            text={labels.newRecord} />
    )
}