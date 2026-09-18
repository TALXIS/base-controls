import { useTheme } from '@fluentui/react';
import { ThemeProvider } from '@utils';
import { components, MenuProps }   from 'react-select';

/** The picker dropdown, with the loading and empty states. */
export const Menu = (props: MenuProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();

    return <ThemeProvider theme={theme}><components.Menu {...props} /></ThemeProvider>
}