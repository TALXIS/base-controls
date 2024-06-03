import React from 'react';
import {Icon} from '@fluentui/react';
import { useGridInstance } from '../../../../hooks/useGridInstance';
import { Text } from '@fluentui/react/lib/Text';
import { emptyRecordStyles } from './styles';

export const EmptyRecords = () => {
    const labels = useGridInstance().labels;

    return (
    <div className={`${emptyRecordStyles.root} TALXIS__grid__empty-records`}>
    <Icon className={emptyRecordStyles.icon} iconName='SearchAndApps' />
    <Text>{labels.norecordsfound()}</Text>
    </div>
    )
}