import { ThemeProvider, useTheme } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { Theming, useThemeGenerator } from '@legacy';
import { MultiValueContainer as NativeMultiValueContainer } from '@components/TaskGrid/modules/lookup-many/components/components/multi-value-container/MultiValueContainer';
import { useColorfulLookupManyProps } from '@components/TaskGrid/modules/lookup-many/components/colorful-lookup-many/context';

export const MultiValueContainer = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const { colorPropertyName = 'color' } = useColorfulLookupManyProps();
    const backgroundColor = (props.data as any).rawData?.[colorPropertyName] ?? theme.palette.neutralLight;
    const textColor = Theming.GetTextColorForBackground(backgroundColor);
    const tagTheme = useThemeGenerator(textColor, backgroundColor, textColor);

    return (
        <ThemeProvider theme={tagTheme} applyTo='none'>
            <NativeMultiValueContainer {...props} />
        </ThemeProvider>
    );
};
