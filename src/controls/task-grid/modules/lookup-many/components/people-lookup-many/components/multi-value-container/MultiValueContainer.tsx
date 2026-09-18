import { MultiValueGenericProps } from 'react-select';
import { MultiValueContainer as NativeMultiValueContainer } from '@components/TaskGrid/modules/lookup-many/components/components/multi-value-container/MultiValueContainer';
import { getMultiValueContainerStyles } from './styles';
import { useMemo } from 'react';

/** A selected record as a persona. */
export const MultiValueContainer = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = useMemo(() => getMultiValueContainerStyles(props.selectProps.isDisabled), [props.selectProps.isDisabled]);
    return (
        <NativeMultiValueContainer {...props} className={styles.root}  />
    );
};
