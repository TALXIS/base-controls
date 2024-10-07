import { ThemeProvider, Toggle } from '@fluentui/react';
import { useControl } from '../../hooks';
import { ITwoOptions } from './interfaces';
import React, { useEffect, useRef, useState } from 'react';
import { OptionSet } from '../OptionSet';

export const TwoOptions = (props: ITwoOptions) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const [isColorFeatureEnabled, setIsColorFeatureEnabled] = useState(false);
    const options = boundValue.attributes.Options;
    const { sizing, onNotifyOutputChanged, theme } = useControl('TwoOptions', props);
    const context = props.context;
    const componentRef = useRef<any>(null);

    useEffect(() => {
        if (props.parameters.EnableOptionSetColors?.raw && options.find(x => x.Color)) {
            setIsColorFeatureEnabled(true);
        } else {
            setIsColorFeatureEnabled(false);
        }
    }, [boundValue.attributes]);

    useEffect(() => {
        if (parameters.AutoFocus?.raw === true) {
            componentRef.current?.focus();
        }
    }, []);

    const handleChange = (value: boolean | undefined): void => {
        onNotifyOutputChanged({
            value: value
        });
    };

    return (
        <ThemeProvider theme={theme} applyTo='none'>
            {isColorFeatureEnabled ? (
                <OptionSet
                    context={props.context}
                    parameters={{
                        value: {
                            raw: boundValue.raw ? 1 : 0,
                            //@ts-ignore - typings
                            attributes: boundValue.attributes
                        },
                        EnableOptionSetColors: {
                            raw: isColorFeatureEnabled
                        },
                    }}
                    onNotifyOutputChanged={(outputs) => {
                        handleChange(outputs.value ? true : false);
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
                    checked={boundValue.raw}
                    componentRef={componentRef}
                    disabled={context.mode.isControlDisabled}
                    inlineLabel
                    onText={options.find(option => option.Value === 1)?.Label || 'Yes'}
                    offText={options.find(option => option.Value === 0)?.Label || 'No'}
                    onChange={(e, value) => handleChange(value)}
                />)}
        </ThemeProvider>
    )
};