import * as React from 'react';
import { useTheme } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueContainerStyles } from './styles';
import { useLookupManyProps } from '../../context';
import { getClassNames } from '@talxis/react-components';

interface IMultiValueProps extends MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any> {
    className?: string;
}

export const MultiValueContainer = ({ children, innerProps, selectProps, className }: IMultiValueProps) => {
    const theme = useTheme();
    const props = useLookupManyProps();
    const styles = React.useMemo(() => getMultiValueContainerStyles(theme, selectProps.isDisabled, props.selectedRecordHeight), [theme, selectProps.isDisabled, props.selectedRecordHeight]);
    return (
        <div {...innerProps} className={getClassNames([styles.root, className])}>
            {children}
        </div>
    );
};
