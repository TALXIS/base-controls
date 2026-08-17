import * as React from 'react';
import { Icon, useTheme } from '@fluentui/react';
import { MultiValueRemoveProps } from 'react-select';
import { getMultiValueRemoveStyles } from './styles';

export const MultiValueRemove = ({ innerProps, selectProps }: MultiValueRemoveProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getMultiValueRemoveStyles(theme), [theme]);
    if(selectProps.isDisabled) {
        return <></>
    }
    return (
        <div {...innerProps} className={styles.root}>
            <Icon iconName="Cancel" className={styles.icon} />
        </div>
    );
};
