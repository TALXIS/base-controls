
import { IMultiSelectOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { IComboBoxOption } from '@fluentui/react';

export const MultiSelectOptionset = (props: IMultiSelectOptionSet) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const defaultValue = boundValue.attributes.DefaultValue.toString();
    const [labels, onNotifyOutputChanged] = useComponent('MultiSelectOptionSet', props);
    const { Options } = parameters.value.attributes;
    const context = props.context;;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const handleChange = (option?: IComboBoxOption | null): void => {
        if (option) {
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
        } else {
            onNotifyOutputChanged({
                value: undefined
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
        selectedKey={boundValue.raw ? boundValue.raw.map(key => key.toString()) : defaultValue}
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
