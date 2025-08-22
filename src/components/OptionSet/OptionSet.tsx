
import { IOptionSet } from './interfaces';
import { useControl } from '../../hooks';
import { ComboBox } from "@talxis/react-components";
import { IComboBox, IComboBoxOption, ThemeProvider } from '@fluentui/react';
import { useEffect, useMemo, useRef } from 'react';
import { useComboBoxTheme } from './useComboBoxTheme';
import { getComboBoxStyles } from './styles';
import { onRenderColorfulOption } from './shared';


export const OptionSet = (props: IOptionSet) => {
    const componentRef = useRef<IComboBox>(null);
    const { sizing, onNotifyOutputChanged, theme } = useControl('OptionSet', props);
    const styles = useMemo(() => getComboBoxStyles(sizing.width, sizing.height), [sizing.width, sizing.height]);
    const [colorFeatureEnabled, overridenTheme] = useComboBoxTheme(props, theme);
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const { Options } = parameters.value.attributes;
    const context = props.context;
    const applicationTheme = props.context.fluentDesignLanguage?.applicationTheme;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);

    const comboBoxOptions: IComboBoxOption[] = Options.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
        title: option.Label
    }));

    useEffect(() => {
        if (parameters.AutoFocus?.raw) {
            componentRef.current?.focus(true);
        }
    }, []);

    const handleChange = (option?: IComboBoxOption | null): void => {
        let value = undefined;
        if (option) {
            value = parseInt(option.key as string);
        }
        onNotifyOutputChanged({
            value: value
        });
    };

    const componentProps = onOverrideComponentProps({
        componentRef: componentRef,
        options: comboBoxOptions,
        readOnly: context.mode.isControlDisabled,
        selectedKey: boundValue.raw?.toString() ?? null,
        errorMessage: boundValue.errorMessage,
        useComboBoxAsMenuWidth: true,
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,
        styles: { root: styles.root, callout: styles.callout },
        onRenderContainer: (containerProps, defaultRender) => <ThemeProvider theme={applicationTheme}>{defaultRender?.(containerProps)}</ThemeProvider>,
        calloutProps: applicationTheme ? {
            theme: applicationTheme
        } : undefined,
        ...(parameters.EnableCopyButton?.raw === true && {
            clickToCopyProps: {
                key: 'copy',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Copy',
                },
            },
        }),
        ...(parameters.EnableDeleteButton?.raw === true && {
            deleteButtonProps: {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Cancel',
                },
                onClick: (e, value) => {
                    handleChange(null);
                },
            },
        }),
        onChange: (e, option) => handleChange(option),
        onRenderOption: colorFeatureEnabled ? (option) => onRenderColorfulOption(Options, option, theme) : undefined,
    });

    return (
        <ThemeProvider theme={overridenTheme} applyTo="none">
            <ComboBox
                {...componentProps} />
        </ThemeProvider>);
};