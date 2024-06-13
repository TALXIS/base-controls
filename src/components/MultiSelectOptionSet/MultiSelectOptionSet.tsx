
import { IMultiSelectOptionSet } from './interfaces';
import { useComponent } from '../../hooks';
import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { IComboBox, IComboBoxOption } from '@fluentui/react';
import React, { useEffect, useRef } from 'react';

export const MultiSelectOptionSet = (props: IMultiSelectOptionSet) => {
    const {sizing, onNotifyOutputChanged} = useComponent('MultiSelectOptionSet', props);
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const componentRef = useRef<IComboBox>(null);
    const { Options } = parameters.value.attributes;
    const context = props.context;
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

    useEffect(() => {
        if (parameters.AutoFocus?.raw) {
            componentRef.current?.focus(true);
        }
    }, []);

    return <ComboBox
        componentRef={componentRef}
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
        selectedKey={boundValue.raw ? boundValue.raw.map(key => key.toString()) : [-1]}
        useComboBoxAsMenuWidth
        styles={{
            root: {
                height: sizing.height,
                width: sizing.width,
                display: 'flex',
                alignItems: 'center',
            },
            callout: {
                maxHeight: '300px !important'
            }
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
