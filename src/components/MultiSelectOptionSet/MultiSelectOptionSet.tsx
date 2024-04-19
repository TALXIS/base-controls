
import { IMultiSelectOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { useState } from 'react';
import { IComboBoxOption } from '@fluentui/react';

export const MultiSelectOptionset = (props: IMultiSelectOptionSet) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const defaulValue = boundValue.attributes.DefaultValue.toString();
    const [labels, onNotifyOutputChanged] = useComponent('MultiSelectOptionSet', props);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(Array.isArray(boundValue.raw) ? boundValue.raw.map(k => k.toString()) : [defaulValue]);
    const { Options } = parameters.value.attributes;
    const context = props.context;;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const handleChange = (option?: IComboBoxOption | null): void => {
        if (option) {
            const optionKey = option.key.toString();
            const updatedSelectedKeys = selectedKeys.includes(optionKey)
                ? selectedKeys.filter(key => key !== optionKey)
                : [...selectedKeys, optionKey];
            setSelectedKeys(updatedSelectedKeys);
            onNotifyOutputChanged({
                value: updatedSelectedKeys.map(key => +key)
            });
        } else {
            setSelectedKeys([]);
            onNotifyOutputChanged({
                value: []
            });
        }
    };

    return <ComboBox
        borderless={parameters.EnableBorder?.raw === false}
        options={comboBoxOptions}
        allowFreeInput={true}
        multiSelect
        autoComplete="on"
        readOnly={context.mode.isControlDisabled}
        dropdownWidth={context.mode.allocatedWidth || undefined}
        selectedKey={selectedKeys}
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
