
import { IOptionSet } from './interfaces';
import { useControl, useControlTheme } from '../../hooks';
import { ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, Icon, ThemeProvider } from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import { createBrandVariants, createV9Theme } from '@fluentui/react-migration-v8-v9';
import Color from 'color';
import { ThemeDesigner } from '@talxis/react-components/dist/utilities/ThemeDesigner';

export const OptionSet = (props: IOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('OptionSet', props);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const componentRef = useRef<IComboBox>(null);
    const parameters = props.parameters;
    const boundValue = parameters.value;
    parameters.value.attributes.Options = [
        {
            "Label": "Option 1",
            Value: 1,
            "Color": ""
        },
        {
            "Label": "Option 2",
            Value: 2,
            "Color": "#33FF57"
        },
        {
            "Label": "Option 3",
            Value: 3,
            "Color": "#3357FF"
        },
        {
            "Label": "Option 4",
            Value: 4,
            "Color": "#F0A500"
        },
        {
            "Label": "Option 5",
            Value: 5,
            "Color": "#8A2BE2"
        }
    ];
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    useEffect(() => {
        if (parameters.AutoFocus?.raw) {
            componentRef.current?.focus(true);
        }
    }, []);

    const overridenFluentDesignLanguage = React.useMemo(() => {
        const isColorEnabled = props.parameters.EnableOptionSetColors?.raw;
        const color = boundValue.attributes.Options.find(x => x.Value === boundValue.raw)?.Color;
        const inputBackground = isColorEnabled && color ? color : theme.semanticColors.inputBackground;
        const textColor = isColorEnabled && color ? Color(color).luminosity() > 0.5 ? '#000000' : '#ffffff' : theme.semanticColors.inputText;

        const primaryColor = textColor == '#000000' ? Color(inputBackground).darken(0.5).hex() : Color(inputBackground).lighten(0.5).hex();
        const customV8Theme = ThemeDesigner.generateTheme({
            primaryColor: primaryColor,
            backgroundColor: theme.semanticColors.bodyBackground,
            textColor: textColor
        });

        const customTokenTheme = createV9Theme(customV8Theme);
        return {
            brand: createBrandVariants(customV8Theme.palette),
            tokenTheme: { ...customTokenTheme, inputBackground: inputBackground, inputText: textColor }
        }
    }, [boundValue.raw]);

    const overridenTheme = useControlTheme(overridenFluentDesignLanguage);
    overridenTheme.semanticColors.successIcon = '#ffffff';
    overridenTheme.palette.themeDarkAlt = '#ffffff';
    const handleChange = (option?: IComboBoxOption | null): void => {
        let value = undefined;
        if (option) {
            value = parseInt(option.key as string);
        }
        onNotifyOutputChanged({
            value: value
        });
    };

    const onRenderOption = (option: IComboBoxOption | undefined) => {
        if (!option) return null;
        const color = Options.find(item => item.Value.toString() === option.key)?.Color;
        return (
            <div>
                {parameters.EnableOptionSetColors?.raw && (
                    <Icon styles={{ root: { color: color ? color : 'transparent', marginRight: '8px', fontSize: '12px' } }} iconName={'CircleFill'} aria-hidden="true" />
                )}
                <span>{option.text}</span>
            </div>
        );
    };

    const componentProps = onOverrideComponentProps({
        componentRef: componentRef,
        options: comboBoxOptions,
        readOnly: context.mode.isControlDisabled,
        selectedKey: boundValue.raw?.toString() ?? null,
        errorMessage: boundValue.errorMessage,
        useComboBoxAsMenuWidth: true,
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,
        styles: {
            root: {
                height: sizing.height,
                width: sizing.width,
                display: 'flex',
                alignItems: 'center',
            },
            callout: {
                maxHeight: '300px !important',
            },
        },
        ...(parameters.EnableCopyButton?.raw === true && {
            clickToCopyProps: {
                key: 'copy',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Copy',
                },
            },
        }),
        ...(parameters.EnableDeleteButton?.raw === true && {
            deleteButtonProps: {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Cancel',
                },
                onClick: (e, value) => {
                    handleChange(null);
                },
            },
        }),
        onChange: (e, option) => handleChange(option),
        onRenderOption: onRenderOption,
    });

    return (
        <ThemeProvider theme={overridenTheme} applyTo="none">
            <ComboBox
                {...componentProps} />
        </ThemeProvider>);
};