import { Toggle } from '@fluentui/react';
import { useComponent } from '../../hooks';
import { ITwoOptions } from './interfaces';

export const TwoOptions = (props: ITwoOptions) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const options = boundValue.attributes.Options;
    const [labels, onNotifyOutputChanged] = useComponent('TwoOptions', props);
    const context = props.context;

    const handleChange = (value: boolean | undefined): void => {
        onNotifyOutputChanged({
            value: Number(value)
        });
    };
    
    return <Toggle
    styles={{
        root: {
            height: context.mode.allocatedHeight || undefined,
            width: context.mode.allocatedWidth || undefined,
        },
    }}
    checked={boundValue.raw}
    label={boundValue.attributes.DisplayName}
    inlineLabel
    onText={options.find(option=>option.Value ===1)?.Label || 'Yes'}
    offText={options.find(option=>option.Value ===0)?.Label || 'No'}
    onChange={(e, value) => handleChange(value)}
/>;
};