import { Toggle } from '@fluentui/react';
import { useComponent } from '../../hooks';
import { ITwoOptions } from './interfaces';

export const TwoOptions = (props: ITwoOptions) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
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
    label="YesNoColumn"
    inlineLabel
    onText="Yes"
    offText="No"
    onChange={(e, value) => handleChange(value)}
/>;
};