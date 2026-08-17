import * as React from 'react';
import { useTheme } from '@fluentui/react';
import { OptionProps } from 'react-select';
import { getOptionStyles } from './styles';

export const Option = (props: OptionProps<ComponentFramework.EntityReference, boolean, any>) => {
    const { children, innerProps, isFocused, isSelected } = props;
    const theme = useTheme();
    const styles = React.useMemo(() => getOptionStyles(theme, isFocused, isSelected), [theme, isFocused, isSelected]);
    return (
        <div {...innerProps} className={styles.root}>
            {children}
        </div>
    );
};
