import React from 'react';
import { IEntity, ILookupTranslations } from '../interfaces';
import { Text } from '@fluentui/react/lib/Text';
import { Link, useTheme } from '@fluentui/react';
import { getLookupStyles, getTargetSelectorStyles } from '../styles';
import { StringProps } from '../../../types';
import { useLoadedEntities } from '../hooks/useLoadedEntities';

interface ITargetSelector {
    labels: Required<StringProps<ILookupTranslations>>,
    entities: IEntity[];
    onEntitySelected: (entityName: string | null) => void;
}


export const TargetSelector = (props: ITargetSelector) => {
    const { labels, entities, onEntitySelected } = { ...props };
    const [loadedEntities] = useLoadedEntities(entities);
    const theme = useTheme();
    const styles = getTargetSelectorStyles(theme);

    return (
        <div className={styles.targetSelector}>
            <Text variant='small'>{labels.resultsFrom()} </Text>
            <div className={styles.targetSelectorLinks}>
                <Link
                    onClick={() => onEntitySelected(null)}
                    className={styles.targetSelectorLink}
                    data-selected={!entities.find(x => x.selected)}>All</Link>
                {loadedEntities &&
                    <>
                        {loadedEntities.map((entity) => {
                            return <Link
                                className={styles.targetSelectorLink}
                                data-selected={entity.selected}
                                onClick={() => onEntitySelected(entity.entityName)}>{entity.metadata.DisplayName}</Link>
                        })}
                    </>
                }
            </div>
        </div>
    )
}