import { useMemo } from 'react';
import { Icon, Text } from '@fluentui/react';
import { useGridService } from '@controls/grid/useGridService';
import { getEmptyRecordsStyles } from './styles';

/** What the grid shows while it has no rows. */
export const EmptyRecords = () => {
    const labels = useGridService('labels');
    const styles = useMemo(() => getEmptyRecordsStyles(), []);

    return (
        <div className={styles.emptyRecordsRoot}>
            <Icon className={styles.icon} iconName='SearchAndApps' />
            <Text>{labels.getLocalizedString('noRecordsFound')}</Text>
        </div>
    )
}
