import { ThemeProvider } from '@fluentui/react';
import { components, MenuProps }   from 'react-select';

/** The picker dropdown, with the loading and empty states. */
export const Menu = (props: MenuProps<ComponentFramework.EntityReference, boolean, any>) => {
    return <ThemeProvider><components.Menu {...props} /></ThemeProvider>
}