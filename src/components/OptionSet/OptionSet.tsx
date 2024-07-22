
import { IOptionSet } from './interfaces';
import { useControl } from '../../hooks';
import { ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, ThemeProvider } from '@fluentui/react';
import React, { useEffect, useRef } from 'react';

export const OptionSet = (props: IOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('OptionSet', props);
    const componentRef = useRef<IComboBox>(null);
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const handleChange = (option?: IComboBoxOption | null): void => {
        let value = undefined;
        if (option) {
            value = parseInt(option.key as string);
        }
        onNotifyOutputChanged({
            value: value
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
                underlined={theme.effects.underlined}
                options={comboBoxOptions}
                readOnly={context.mode.isControlDisabled}
                //the defaultValue comes in the raw prop directly, no need to look at it
                selectedKey={boundValue.raw?.toString() ?? -1}
                errorMessage={boundValue.errorMessage}
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
                deleteButtonProps={parameters.EnableDeleteButton?.raw === true ? {
                    key: 'delete',
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Delete'
                    },
                    onClick: (e, value) => { handleChange(null); }
                } : undefined}
                onChange={(e, option) => handleChange(option)}
            /></ThemeProvider>);
};