import { MultiValueGenericProps } from 'react-select';
import { MultiValueContainer as NativeMultiValueContainer } from '@components/TaskGrid/components/grid/lookup-many/components/multi-value-container/MultiValueContainer';
import { getMultiValueContainerStyles } from './styles';
import { useMemo } from 'react';

export const MultiValueContainer = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = useMemo(() => getMultiValueContainerStyles(props.selectProps.isDisabled), [props.selectProps.isDisabled]);
    return (
        <NativeMultiValueContainer {...props} className={styles.root}  />
    );
};
