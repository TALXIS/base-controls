
import { IOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { IComboBoxOption } from '@fluentui/react';
import React from 'react';

export const OptionSet = (props: IOptionSet) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const [labels, onNotifyOutputChanged] = useComponent('OptionSet', props);
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const handleChange = (option?: IComboBoxOption | null): void => {
        let value = undefined;
        if(option) {
            value = parseInt(option.key as string);
        }
        onNotifyOutputChanged({
            value: value
        });
    };

    return <ComboBox
        borderless={parameters.EnableBorder?.raw === false}
        options={comboBoxOptions}
        autofill={parameters.AutoFocus?.raw === true ? {
            autoFocus: true
        }: undefined}
        readOnly={context.mode.isControlDisabled}
        //the defaultValue comes in the raw prop directly, no need to look at it
        selectedKey={boundValue.raw?.toString() ?? -1}
        dropdownWidth={context.mode.allocatedWidth || undefined}
        errorMessage={boundValue.errorMessage}
        styles={{
            root: {
                height: context.mode.allocatedHeight || undefined,
                width: context.mode.allocatedWidth || undefined,
                display: 'flex',
                alignItems: 'center',
            },
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