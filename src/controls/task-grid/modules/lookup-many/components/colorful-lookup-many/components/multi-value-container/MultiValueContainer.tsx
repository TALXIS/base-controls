import { useTheme } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { ThemeProvider, getTextColorForBackground, useThemeGenerator } from '@theme';
import { MultiValueContainer as NativeMultiValueContainer } from '@controls/task-grid/modules/lookup-many/components/components/multi-value-container/MultiValueContainer';
import { useColorfulLookupManyProps } from '@controls/task-grid/modules/lookup-many/components/colorful-lookup-many/context';

/** A selected record as a coloured tag. */
export const MultiValueContainer = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const { colorPropertyName = 'color' } = useColorfulLookupManyProps();
    const backgroundColor = (props.data as any).rawData?.[colorPropertyName] ?? theme.palette.neutralLight;
    const textColor = getTextColorForBackground(backgroundColor);
    const tagTheme = useThemeGenerator({ primary: textColor, background: backgroundColor, text: textColor });

    return (
        <ThemeProvider theme={tagTheme} applyTo='none'>
            <NativeMultiValueContainer {...props} />
        </ThemeProvider>
    );
};
