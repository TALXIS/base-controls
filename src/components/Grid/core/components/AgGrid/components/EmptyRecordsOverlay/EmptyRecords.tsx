import { Icon } from '@fluentui/react';
import { useGridInstance } from '../../../../hooks/useGridInstance';
import { Text } from '@fluentui/react';
import { emptyRecordStyles } from './styles';
import { Grid2 } from '../../../../model/Grid';

export const EmptyRecords = () => {
    const grid: Grid2 = useGridInstance() as any;
    const labels = grid.getLabels();

    return (
        <div className={emptyRecordStyles.emptyRecorsRoot}>
            <Icon className={emptyRecordStyles.icon} iconName='SearchAndApps' />
            <Text>{labels.norecordsfound()}</Text>
        </div>
    )
}