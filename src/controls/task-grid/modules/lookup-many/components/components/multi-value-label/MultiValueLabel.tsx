import * as React from 'react';
import { Link } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueLabelStyles } from './styles';

/** Renders a selected record's display name, and opens it on click. */
export const MultiValueLabel = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = React.useMemo(() => getMultiValueLabelStyles(), []);
    const {selectProps, data, children} = props;
    const { onNavigate } = selectProps as any;

    const label = <span title={data.name} className={styles.root}>{children}</span>;

    if (onNavigate) {
        return (
            <Link
                styles={{ root: styles.link }}
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(data);
                }}
            >
                {label}
            </Link>
        );
    }
    return label;
};
