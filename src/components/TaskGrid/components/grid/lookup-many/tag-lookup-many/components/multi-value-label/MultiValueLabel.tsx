import * as React from 'react';
import { Link } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueLabelStyles } from './styles';

export const MultiValueLabel = ({ data, selectProps }: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = React.useMemo(() => getMultiValueLabelStyles(), []);
    const { onNavigate } = selectProps as any;

    if (onNavigate) {
        return (
            <Link
                styles={{ root: styles.link }}
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(data);
                }}
            >
                {data.name}
            </Link>
        );
    }

    return <span className={styles.root}>{data.name}</span>;
};
