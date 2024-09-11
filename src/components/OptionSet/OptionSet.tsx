
import { IOptionSet } from './interfaces';
import { useControl, useControlTheme } from '../../hooks';
import { ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, Icon, ThemeProvider } from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import { createBrandVariants, createV9Theme } from '@fluentui/react-migration-v8-v9';
import Color from 'color';

export const OptionSet = (props: IOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('OptionSet', props);
    const componentRef = useRef<IComboBox>(null);
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const [inputBackground, setInputBackground] = useState<string>(theme.semanticColors.inputBackground);
    const [inputText, setInputText] = useState<string>(theme.semanticColors.inputText);
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    useEffect(() => {
        if (parameters.AutoFocus?.raw) {
            componentRef.current?.focus(true);
        }
        if (parameters.EnableOptionSetColors?.raw && boundValue.raw?.toString()) {
            setColor(boundValue.raw?.toString())
        }
    }, []);

    const customTokenTheme = createV9Theme(theme);

    const overridenFluentDesignLanguage = React.useMemo(() => {
        return {
            brand: createBrandVariants(theme.palette),
            tokenTheme: { ...customTokenTheme, inputBackground: inputBackground, inputText: inputText }
        }
    }, [inputBackground, inputText, customTokenTheme]);

    const overridenTheme = useControlTheme(overridenFluentDesignLanguage);

    const handleChange = (option?: IComboBoxOption | null): void => {
        let value = undefined;
        if (option) {
            value = parseInt(option.key as string);
        }
        if (parameters.EnableOptionSetColors?.raw) {
            setColor(option?.key ?? null);
        }
        onNotifyOutputChanged({
            value: value
        });
    };

    const setColor = (key: string | number | null) => {
        const selectedOption = Options.find(item => item.Value.toString() === key);
        const defaultBackground = theme.semanticColors.inputBackground;
        const defaultText = theme.semanticColors.inputText;

        if (!selectedOption?.Color) {
            setInputBackground(defaultBackground);
            setInputText(defaultText);
            return;
        }

        setInputBackground(selectedOption.Color);
        const luminance = Color(selectedOption.Color).luminosity();
        const textColor = luminance > 0.5 ? overridenTheme.palette.black : overridenTheme.palette.white;
        setInputText(textColor);
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

    return (
        <ThemeProvider theme={overridenTheme} applyTo="none">
            <ComboBox
                componentRef={componentRef}
                options={comboBoxOptions}
                readOnly={context.mode.isControlDisabled}
                selectedKey={boundValue.raw?.toString() ?? null}
                errorMessage={boundValue.errorMessage}
                useComboBoxAsMenuWidth
                hideErrorMessage={!parameters.ShowErrorMessage?.raw}
                styles={{
                    root: {
                        height: sizing.height,
                        width: sizing.width,
                        display: 'flex',
                        alignItems: 'center',
                        ...(parameters.EnableOptionSetColors?.raw && {
                            '.ms-Icon': {
                                color: `${inputText} !important`,
                            },
                        }),
                    },
                    callout: {
                        maxHeight: '300px !important'
                    },
                }}
                clickToCopyProps={parameters.EnableCopyButton?.raw === true ? {
                    key: 'copy',
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Copy',
                        ...(parameters.EnableOptionSetColors?.raw && {
                            styles: {
                                root: {
                                    color: `${inputText} !important`,
                                    ':hover': {
                                        color: `${inputText} !important`,
                                    },
                                },
                            },
                        })
                    }
                } : undefined}
                deleteButtonProps={parameters.EnableDeleteButton?.raw === true ? {
                    key: 'delete',
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Cancel',
                        ...(parameters.EnableOptionSetColors?.raw && {
                            styles: {
                                root: {
                                    color: `${inputText} !important`,
                                    ':hover': {
                                        color: `${inputText} !important`,
                                    },
                                },
                            },
                        })
                    },
                    onClick: (e, value) => { handleChange(null); }
                } : undefined}
                onChange={(e, option) => handleChange(option)}
                onRenderOption={onRenderOption}
            /></ThemeProvider>);
};