import { Toggle } from '@fluentui/react';
import { ThemeContext } from '@utils';
import { useControl } from '@hooks';
import { ITwoOptions } from './interfaces';
import React, { useEffect, useRef, useState } from 'react';
import { OptionSet } from '../OptionSet';
import { twoOptionsTranslations } from './translations';

export const TwoOptions = (props: ITwoOptions) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const options = boundValue.attributes.Options;
    const { labels, sizing, onNotifyOutputChanged, theme } = useControl('TwoOptions', props, twoOptionsTranslations);
    const context = props.context;
    const componentRef = useRef<any>(null);

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
        parameters.Cell?.raw?.finishEditing();
    };

    return (
        <ThemeContext theme={theme}>
            {isColorFeatureEnabled() ? (
                <OptionSet
                    context={props.context}
                    parameters={{
                        ...parameters as any,
                        value: {
                            raw: boundValue.raw !== null ? boundValue.raw ? 1 : 0 : boundValue.raw,
                            //@ts-ignore - typings
                            attributes: boundValue.attributes
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
                            //the pill is its own size, and stays centred in whatever the toggle fills
                            ...(sizing.fillsAvailableSpace && { display: 'flex', alignItems: 'center' }),
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
                    onText={options.find(option => option.Value === 1)?.Label || labels.yes()}
                    offText={options.find(option => option.Value === 0)?.Label || labels.no()}
                    onChange={(e, value) => handleChange(value)}
                />)}
        </ThemeContext>
    )
};