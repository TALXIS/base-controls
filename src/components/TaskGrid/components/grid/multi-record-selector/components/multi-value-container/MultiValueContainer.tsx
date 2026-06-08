import * as React from 'react';
import { useTheme } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueContainerStyles } from './styles';

export const MultiValueContainer = ({ children, innerProps, selectProps }: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getMultiValueContainerStyles(theme, selectProps.isDisabled), [theme, selectProps.isDisabled]);
    return (
        <div {...innerProps} className={styles.root}>
            {children}
        </div>
    );
};