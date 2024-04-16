
import { IOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { IComboBox, IComboBoxOption, IconButton } from '@fluentui/react';
import { useEffect, useState } from 'react';

export const OptionSet = (props: IOptionSet) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const [onNotifyOutputChanged] = useComponent(props);
    const [value, setSelectedValue] = useState<string | null>(boundValue.raw?.toString() ?? boundValue.attributes.DefaultValue.toString());
    const { Options } = parameters.value.attributes;
    const context = props.context;;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));
    
    const handleChange = (e: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
        if (option) {
            const selectedKey = option.key.toString();
            setSelectedValue(selectedKey);
            onNotifyOutputChanged({
                value: +selectedKey
            });
        }
    };

    return <ComboBox
        options={comboBoxOptions}
        readOnly={context.mode.isControlDisabled}
        selectedKey={value}
        dropdownWidth={context.mode.allocatedWidth || undefined}
        deleteButtonProps={ {
            key: 'delete',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Delete'
            },
            onClick: () => setSelectedValue(null)
        }}
        onChange={handleChange}
    />;
};