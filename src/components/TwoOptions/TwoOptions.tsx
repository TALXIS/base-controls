import { ThemeProvider, Toggle } from '@fluentui/react';
import { useControl } from '@hooks';
import { ITwoOptions } from './interfaces';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OptionSet } from '../OptionSet';
import { twoOptionsTranslations } from './translations';

export const TwoOptions = (props: ITwoOptions) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const { labels, sizing, onNotifyOutputChanged, theme } = useControl('TwoOptions', props, twoOptionsTranslations);
    const context = props.context;
    const componentRef = useRef<any>(null);
    const options = useMemo(() => {
        const metadataOptions = boundValue.attributes?.Options ?? [];
        const getOption = (value: number, fallbackLabel: string) =>
            metadataOptions.find(option => option.Value === value) ?? { Value: value, Label: fallbackLabel, Color: '' };
        return [getOption(0, labels.no()), getOption(1, labels.yes())];
    }, [boundValue.attributes?.Options, labels]);

    useEffect(() => {
        if (parameters.AutoFocus?.raw === true) {
            componentRef.current?.focus();
        }
    }, []);

    const isColorFeatureEnabled = () => {
        if (props.parameters.EnableOptionSetColors?.raw && options.find(x => x.Color)) {
            return true;
        }
        return false;
    }

    const handleChange = (value: boolean | undefined): void => {
        onNotifyOutputChanged({
            value: value
        });
    };

    return (
        <ThemeProvider theme={theme} applyTo='none'>
            {isColorFeatureEnabled() ? (
                <OptionSet
                    context={props.context}
                    parameters={{
                        ...parameters as any,
                        value: {
                            raw: boundValue.raw !== null ? boundValue.raw ? 1 : 0 : boundValue.raw,
                            //@ts-ignore - typings
                            attributes: {
                                ...boundValue.attributes,
                                Options: options
                            }
                        },
                        EnableOptionSetColors: {
                            raw: true
                        }
                    }}
                    onNotifyOutputChanged={(outputs) => {
                        handleChange(outputs.value == 1 ? true : outputs.value == 0 ? false : undefined);
                    }}
                />
            ) : (
                <Toggle
                    styles={{
                        root: {
                            height: sizing.height,
                            width: sizing.width,
                            marginBottom: 0,
                        },
                        container: {
                            alignItems: 'center'
                        }
                    }}
                    theme={theme}
                    checked={!!boundValue.raw}
                    componentRef={componentRef}
                    disabled={context.mode.isControlDisabled}
                    inlineLabel
                    onText={options.find(option => option.Value === 1)?.Label}
                    offText={options.find(option => option.Value === 0)?.Label}
                    onChange={(e, value) => handleChange(value)}
                />)}
        </ThemeProvider>
    )
};