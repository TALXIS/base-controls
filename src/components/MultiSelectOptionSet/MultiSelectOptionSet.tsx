
import { IMultiSelectOptionSet } from './interfaces';
import { useControl } from '../../hooks';
import { ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, ThemeProvider } from '@fluentui/react';
import React, { useEffect, useRef } from 'react';

export const MultiSelectOptionSet = (props: IMultiSelectOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('MultiSelectOptionSet', props);
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
        if (!option) {
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

    return (
        <ThemeProvider theme={theme} applyTo="none">
            <ComboBox
                componentRef={componentRef}
                options={comboBoxOptions}
                allowFreeInput={true}
                multiSelect
                autoComplete="on"
                theme={theme}
                autofill={parameters.AutoFocus?.raw === true ? {
                    autoFocus: true
                } : undefined}
                readOnly={context.mode.isControlDisabled}
                errorMessage={boundValue.errorMessage}
                selectedKey={boundValue.raw ? boundValue.raw.map(key => key.toString()) : [-1]}
                useComboBoxAsMenuWidth
                hideErrorMessage={!parameters.ShowErrorMessage?.raw}
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
                clickToCopyProps={parameters.EnableCopyButton?.raw === true ? {
                    key: 'copy',
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Copy'
                    }
                } : undefined}
                deleteButtonProps={props.parameters.EnableDeleteButton?.raw === true ? {
                    key: 'delete',
                    showOnlyOnHover: false,
                    iconProps: {
                        iconName: 'Cancel'
                    },
                    onClick: (e, value) => {
                        handleChange(null);
                    }
                } : undefined}
                onChange={(e, option) => handleChange(option)} />
        </ThemeProvider>
    );
};
