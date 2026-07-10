import * as React from 'react';
import { Icon, useTheme } from '@fluentui/react';
import { MultiValueRemoveProps } from 'react-select';
import { getMultiValueRemoveStyles } from './styles';
import { useLookupManyProps } from '../../context';

export const MultiValueRemove = ({ innerProps, selectProps }: MultiValueRemoveProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const props = useLookupManyProps();
    const styles = React.useMemo(() => getMultiValueRemoveStyles(theme, props.selectedRecordHeight), [theme, props.selectedRecordHeight]);
    if(selectProps.isDisabled) {
        return <></>
    }
    return (
        <div {...innerProps} className={styles.root}>
            <Icon iconName="Cancel" className={styles.icon} />
        </div>
    );
};
