import React from 'react';
import { IEntity } from '../interfaces';
import { Text } from '@fluentui/react/lib/Text';
import { Link, useTheme } from '@fluentui/react';
import { getTargetSelectorStyles } from '../styles';
import { useLoadedEntities } from '../hooks/useLoadedEntities';
import { useLabels } from '@utils';
import { LOOKUP_LABELS } from '../labels';

interface ITargetSelector {
    entities: IEntity[];
    onEntitySelected: (entityName: string | null) => void;
}


export const TargetSelector = (props: ITargetSelector) => {
    const { entities, onEntitySelected } = { ...props };
    const labels = useLabels(LOOKUP_LABELS);
    const [loadedEntities] = useLoadedEntities(entities);
    const theme = useTheme();
    const styles = getTargetSelectorStyles(theme);

    return (
        <div className={styles.targetSelector}>
            <Text variant='small'>{labels.get('lookup.resultsFrom')} </Text>
            <div className={styles.targetSelectorLinks}>
                <Link
                    onClick={() => onEntitySelected(null)}
                    className={styles.targetSelectorLink}
                    data-selected={!entities.find(x => x.selected)}>{labels.get('lookup.all')}</Link>
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