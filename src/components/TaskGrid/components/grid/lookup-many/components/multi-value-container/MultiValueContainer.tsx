import * as React from 'react';
import { useTheme } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueContainerStyles } from './styles';
import { useLookupManyProps } from '../../context';

export const MultiValueContainer = ({ children, innerProps, selectProps }: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const props = useLookupManyProps();
    const styles = React.useMemo(() => getMultiValueContainerStyles(theme, selectProps.isDisabled, props.selectedRecordHeight), [theme, selectProps.isDisabled, props.selectedRecordHeight]);
    return (
        <div {...innerProps} className={styles.root}>
            {children}
        </div>
    );
};
