import { Icon } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { useGridInstance } from '../../grid/useGridInstance';
import { emptyRecordStyles } from './styles';

export const EmptyRecords = () => {
    const grid = useGridInstance();
    const labels = grid.getLabels();

    return (
        <div className={emptyRecordStyles.emptyRecordsRoot}>
            <Icon className={emptyRecordStyles.icon} iconName='SearchAndApps' />
            <Text>{labels.norecordsfound()}</Text>
        </div>
    )
}