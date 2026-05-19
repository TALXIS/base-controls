import * as React from 'react';
import { Link } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueLabelStyles } from './styles';

export const MultiValueLabel = (props:  MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = React.useMemo(() => getMultiValueLabelStyles(), []);
    const { onNavigate } = props.selectProps as any;

    if (onNavigate) {
        return (
            <Link
                styles={{root: styles.link}}
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate();
                }}
            >
                {props.children}
            </Link>
        );
    }
    return <span className={styles.root}>{props.children}</span>;
};
