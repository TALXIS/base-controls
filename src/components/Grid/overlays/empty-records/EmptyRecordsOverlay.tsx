import { Icon } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { useGridService } from '@components/Grid/grid/useGridService';
import { emptyRecordStyles } from './styles';

export const EmptyRecords = () => {
    const labels = useGridService('labels');

    return (
        <div className={emptyRecordStyles.emptyRecordsRoot}>
            <Icon className={emptyRecordStyles.icon} iconName='SearchAndApps' />
            <Text>{labels.getLocalizedString('noRecordsFound')}</Text>
        </div>
    )
}