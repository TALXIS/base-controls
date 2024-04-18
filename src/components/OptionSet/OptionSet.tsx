
import { IOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import {  IComboBoxOption} from '@fluentui/react';
import * as React from 'react';

export const OptionSet = (props: IOptionSet) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const defaulValue = boundValue.attributes.DefaultValue.toString();
    const [labels, onNotifyOutputChanged] = useComponent('OptionSet', props);
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const handleChange = (option?: IComboBoxOption | null): void => {
        const selectedKey = option?.key.toString();
        onNotifyOutputChanged({
            value: +selectedKey!
        });
    };

    return <ComboBox
        borderless={parameters.EnableBorder?.raw === false}
        options={comboBoxOptions}
        autofill={parameters.AutoFocus?.raw === true ? {
            autoFocus: true
        }: undefined}
        readOnly={context.mode.isControlDisabled}
        selectedKey={boundValue.raw?.toString() ?? defaulValue}
        dropdownWidth={context.mode.allocatedWidth || undefined}
        style={{
            height: context.mode.allocatedHeight || undefined,
            width: context.mode.allocatedWidth || undefined
        }}
        deleteButtonProps={{
            key: 'delete',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Delete'
            },
            onClick: (e, value) => { handleChange(null); }
        }}
        onChange={(e, option) => handleChange(option)}
    />;
};