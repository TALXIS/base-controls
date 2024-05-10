
import { IMultiSelectOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { IComboBoxOption } from '@fluentui/react';
import React from 'react';

export const MultiSelectOptionSet = (props: IMultiSelectOptionSet) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const [labels, onNotifyOutputChanged] = useComponent('MultiSelectOptionSet', props);
    const { Options } = parameters.value.attributes;
    const context = props.context;;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const handleChange = (option?: IComboBoxOption | null): void => {
        if(!option) {
            onNotifyOutputChanged({
                value: undefined
            });
            return;
        }
        const optionKey = option.key.toString();
        const updatedSelectedKeys = new Set(boundValue.raw || []);
        if (option.selected) {
            updatedSelectedKeys.add(+optionKey);
        } else {
            updatedSelectedKeys.delete(+optionKey);
        }
        const updatedSelectedKeysArray = Array.from(updatedSelectedKeys);
        
        onNotifyOutputChanged({
            value: updatedSelectedKeysArray.map(key => +key)
        });
    };

    return <ComboBox
        borderless={parameters.EnableBorder?.raw === false}
        options={comboBoxOptions}
        allowFreeInput={true}
        multiSelect
        autoComplete="on"
        autofill={parameters.AutoFocus?.raw === true ? {
            autoFocus: true
        }: undefined}
        readOnly={context.mode.isControlDisabled}
        errorMessage={boundValue.errorMessage}
        dropdownWidth={context.mode.allocatedWidth || undefined}
        selectedKey={boundValue.raw ? boundValue.raw.map(key => key.toString()) : [-1]}
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
            showOnlyOnHover: false,
            iconProps: {
                iconName: 'Delete'
            },
            onClick: (e, value) => {
                handleChange(null);
            }
        }}
        onChange={(e, option) => handleChange(option)} />;
};
