import * as React from 'react';
import { components, OptionProps } from 'react-select';
import { useTheme } from '@fluentui/react';
import { useColorfulLookupManyProps } from '../../context';
import { getOptionStyles } from './styles';

export const Option = (props: OptionProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const { colorPropertyName = 'color' } = useColorfulLookupManyProps();
    const color = (props.data as any).rawData?.[colorPropertyName] ?? theme.palette.neutralLight
    const styles = React.useMemo(() => getOptionStyles(color), [color]);

    return (
        <components.Option {...props}>
            <div className={styles.container}>
                <span className={styles.dot} />
                {props.children}
            </div>
        </components.Option>
    );
};
