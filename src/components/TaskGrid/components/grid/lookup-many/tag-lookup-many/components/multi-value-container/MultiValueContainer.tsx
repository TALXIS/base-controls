import * as React from 'react';
import { ThemeProvider, useTheme } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { Theming, useThemeGenerator } from '@talxis/react-components';
import { MultiValueContainer as NativeMultiValueContainer } from '../../../components/multi-value-container/MultiValueContainer';
import { useTagLookupManyProps } from '../../context';

export const MultiValueContainer = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const theme = useTheme();
    const { colorPropertyName = 'color' } = useTagLookupManyProps();
    const backgroundColor = (props.data as any).rawData?.[colorPropertyName] ?? theme.palette.neutralLight;
    const textColor = Theming.GetTextColorForBackground(backgroundColor);
    const tagTheme = useThemeGenerator(textColor, backgroundColor, textColor);

    return (
        <ThemeProvider theme={tagTheme} applyTo='none'>
            <NativeMultiValueContainer {...props} />
        </ThemeProvider>
    );
};
