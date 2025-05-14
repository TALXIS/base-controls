
import { IMultiSelectOptionSet } from './interfaces';
import { useControl } from '../../hooks';
import { ColorfulOption, ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, ThemeProvider } from '@fluentui/react';
import { useEffect, useMemo, useRef } from 'react';
import { getComboBoxStyles } from './styles';
import { getIsColorFeatureEnabled, onRenderColorfulOption } from '../OptionSet/shared';

export const MultiSelectOptionSet = (props: IMultiSelectOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('MultiSelectOptionSet', props);
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const componentRef = useRef<IComboBox>(null);
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const applicationTheme = props.context.fluentDesignLanguage?.applicationTheme;
    const isColorFeatureEnabled = useMemo(() => getIsColorFeatureEnabled(props.parameters.EnableMultiSelectOptionSetColors?.raw, Options), [props.parameters.EnableMultiSelectOptionSetColors?.raw, Options]);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const styles = useMemo(() => getComboBoxStyles(isColorFeatureEnabled, sizing.width, sizing.height), [isColorFeatureEnabled, sizing.width, sizing.height]);
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

    const componentProps = onOverrideComponentProps({
        componentRef: componentRef,
        options: comboBoxOptions,
        allowFreeInput: true,
        multiSelect: true,
        autoComplete: "on",
        autofill: parameters.AutoFocus?.raw === true ? {
            autoFocus: true
        } : undefined,
        onRenderContainer: (containerProps, defaultRender) => <ThemeProvider theme={props.context.fluentDesignLanguage?.applicationTheme}>{defaultRender?.(containerProps)}</ThemeProvider>,
        onRenderOption: isColorFeatureEnabled ? (option) => onRenderColorfulOption(Options, option, theme) : undefined,
        calloutProps: applicationTheme ? {
            theme: applicationTheme
        } : undefined,
        readOnly: context.mode.isControlDisabled,
        errorMessage: boundValue.errorMessage,
        selectedKey: boundValue.raw ? boundValue.raw.map(key => key.toString()) : null,
        useComboBoxAsMenuWidth: true,
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,
        styles: { root: styles.root, callout: styles.callout },
        clickToCopyProps: parameters.EnableCopyButton?.raw === true ? {
            key: 'copy',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Copy'
            }
        } : undefined,
        deleteButtonProps: parameters.EnableDeleteButton?.raw === true ? {
            key: 'delete',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Cancel'
            },
            onClick: (e, value) => {
                handleChange(null);
            }
        } : undefined,
        onChange: (e, option) => handleChange(option),
    });

    return (
        <ThemeProvider theme={theme} applyTo="none">
            <ComboBox {...componentProps} />
        </ThemeProvider>
    );
};
