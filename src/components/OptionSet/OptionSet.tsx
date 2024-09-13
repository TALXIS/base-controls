
import { IOptionSet } from './interfaces';
import { useControl, useControlTheme } from '../../hooks';
import { ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, Icon, ThemeProvider } from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import { createBrandVariants, createV9Theme } from '@fluentui/react-migration-v8-v9';
import Color from 'color';

export const OptionSet = (props: IOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('OptionSet', props);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const componentRef = useRef<IComboBox>(null);
    const parameters = props.parameters;
    const boundValue = parameters.value;
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

    const customTokenTheme = createV9Theme(theme);

    const overridenFluentDesignLanguage = React.useMemo(() => {
        const isColorEnabled = props.parameters.EnableOptionSetColors?.raw;
        const color = boundValue.attributes.Options.find(x => x.Value === boundValue.raw)?.Color;
        const inputBackground = isColorEnabled && color ? color : theme.semanticColors.inputBackground;
        const textColor = isColorEnabled && color ? Color(color).luminosity() > 0.5 ? theme.palette.black : theme.palette.white : theme.semanticColors.inputText;

        return {
            brand: createBrandVariants(theme.palette),
            tokenTheme: { ...customTokenTheme, inputBackground: inputBackground, inputText: textColor }
        }
    }, [customTokenTheme]);

    const overridenTheme = useControlTheme(overridenFluentDesignLanguage);

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
                ...(parameters.EnableOptionSetColors?.raw && {
                    '.ms-Icon': {
                        color: `${overridenTheme.semanticColors.inputText} !important`,
                    },
                }),
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
                    ...(parameters.EnableOptionSetColors?.raw && {
                        styles: {
                            root: {
                                color: `${overridenTheme.semanticColors.inputText} !important`,
                                ':hover': {
                                    color: `${overridenTheme.semanticColors.inputText} !important`,
                                },
                            },
                        },
                    }),
                },
            },
        }),
        ...(parameters.EnableDeleteButton?.raw === true && {
            deleteButtonProps: {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Cancel',
                    ...(parameters.EnableOptionSetColors?.raw && {
                        styles: {
                            root: {
                                color: `${overridenTheme.semanticColors.inputText} !important`,
                                ':hover': {
                                    color: `${overridenTheme.semanticColors.inputText} !important`,
                                },
                            },
                        },
                    }),
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