import { ThemeProvider } from '@fluentui/react';
import { components, MenuProps }   from 'react-select';

export const Menu = (props: MenuProps<ComponentFramework.EntityReference, boolean, any>) => {
    return <ThemeProvider><components.Menu {...props} /></ThemeProvider>
}