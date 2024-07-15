import { Toggle } from '@fluentui/react';
import { useComponent } from '../../hooks';
import { ITwoOptions } from './interfaces';
import React, { useEffect, useRef } from 'react';

export const TwoOptions = (props: ITwoOptions) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const options = boundValue.attributes.Options;
    const {sizing, onNotifyOutputChanged, theme} = useComponent('TwoOptions', props);
    const context = props.context;
    const componentRef = useRef<any>(null);
    
    useEffect(() => {
        if(parameters.AutoFocus?.raw === true) {
            componentRef.current.focus();
        }
    }, []);

    const handleChange = (value: boolean | undefined): void => {
        onNotifyOutputChanged({
            value: value
        });
    };
    
    return <Toggle
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
    onText={options.find(option=>option.Value ===1)?.Label || 'Yes'}
    offText={options.find(option=>option.Value ===0)?.Label || 'No'}
    onChange={(e, value) => handleChange(value)}
/>;
};