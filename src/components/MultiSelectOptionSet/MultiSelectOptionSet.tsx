
import { IMultiSelectOptionSet } from './interfaces';
import { useControl } from '../../hooks';
import { ColorfulOption, ComboBox, TextField } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, ThemeProvider } from '@fluentui/react';
import { useEffect, useMemo, useRef } from 'react';
import { getComboBoxStyles } from './styles';
import ReactDOM from 'react-dom';
import React from 'react';
import { ColorfulOptions } from './ColorfulOptions/ColorfulOptions';
import { getIsColorFeatureEnabled, onRenderColorfulOption } from '../OptionSet/shared';

export const MultiSelectOptionSet = (props: IMultiSelectOptionSet) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('MultiSelectOptionSet', props);
    const ref = useRef<HTMLDivElement>(null);
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

    const isEmptyValue = () => {
        if (!boundValue.raw) {
            return true;
        }
        if (boundValue.raw.length === 0) {
            return true;
        }
        return false;
    }

    const getIsColorFeatureEnabled = () => {
        if (props.parameters.EnableMultiSelectOptionSetColors?.raw && Options.find(x => x.Color)) {
            return true;
        }
        return false;
    }

    const renderColorfulOptions = () => {
        const className = 'talxis__multiSelectOptionSet__colorfulOptions';
        const parent: HTMLDivElement = ref.current?.querySelector('.ms-ComboBox')!;
        const container = document.createElement('div');
        container.setAttribute('class', `${className} ${styles.colorfulOptionsWrapper}`);
        container.onclick = () => componentRef.current?.focus(true);

        ReactDOM.render(React.createElement(ColorfulOptions, {
            value: boundValue
        }), container);

        const existingContainer = parent.querySelector(`:scope>.${className}`);
        if (existingContainer && isEmptyValue()) {
            //clear the container if no values are selected
            parent.removeChild(existingContainer);
        }
        if (!existingContainer) {
            parent.prepend(container);
        }
        else {
            existingContainer.replaceWith(container);
        }
    }


    useEffect(() => {
        if (parameters.AutoFocus?.raw) {
            componentRef.current?.focus(true);
        }
    }, []);

    useEffect(() => {
        if (getIsColorFeatureEnabled()) {
            renderColorfulOptions();
        }
    }, [boundValue.raw]);

    const styles = getComboBoxStyles(getIsColorFeatureEnabled(), isEmptyValue(), sizing.width, sizing.height)

    const componentProps = onOverrideComponentProps({
        componentRef: componentRef,
        ref: ref,
        options: comboBoxOptions,
        allowFreeInput: true,
        multiSelect: true,
        autoComplete: "on",
        autofill: parameters.AutoFocus?.raw === true ? {
            autoFocus: true,
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
