import React from 'react';
import { IEntity } from './interfaces';
import { Text } from '@fluentui/react/lib/Text';
import { Link, useTheme } from '@fluentui/react';
import { getLookupStyles } from './styles';

interface ITargetSelector {
    entities: IEntity[];
    onEntitySelected: (entityName: string | null) => void;
}


export const TargetSelector = (props: ITargetSelector) => {
    const { entities, onEntitySelected } = { ...props };
    const theme = useTheme();
    const styles = getLookupStyles(theme);
    return (
        <div className={styles.targetSelector}>
            <Text variant='small'>Results from: </Text>
            <div className={styles.targetSelectorLinks}>
            <Link 
                onClick={() => onEntitySelected(null)}
                className={styles.targetSelectorLink} 
                data-selected={!entities.find(x => x.selected)}>All</Link>
            {entities.map(entity => {
                return <Link 
                    className={styles.targetSelectorLink}
                    data-selected={entity.selected} 
                    onClick={() => onEntitySelected(entity.entityName)}>{entity.metadata.DisplayName}</Link>
            })}
            </div>
        </div>
    )
}