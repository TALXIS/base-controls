import { TextField as TextFieldBase } from "@talxis/react-components";
import { useInputBasedControl } from '../../hooks/useInputBasedControl';
import { ITextField, ITextFieldOutputs, ITextFieldParameters } from './interfaces';
import { ICommandBarItemProps, ThemeProvider } from '@fluentui/react';
import { DataTypes } from "@talxis/client-libraries";

export const TextField = (props: ITextField) => {
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const { value, sizing, theme, setValue, onNotifyOutputChanged } = useInputBasedControl<string | undefined, ITextFieldParameters, ITextFieldOutputs, any>('TextField', props);

    const getInputType = () => {
        switch (boundValue.type) {
            case 'SingleLine.Email': {
                return 'email';
            }
            case 'SingleLine.URL': {
                return 'url';
            }
            case 'SingleLine.Phone': {
                return 'tel';
            }
        }
        return "text";
    }
    const getSuffixItems = (): ICommandBarItemProps[] | undefined => {
        if (parameters.EnableTypeSuffix?.raw === false) {
            return undefined;
        }
        const disabled = boundValue.error || !boundValue.raw
        switch (boundValue.type) {
            case 'SingleLine.Email': {
                return [{
                    key: 'sendMail',
                    disabled: disabled,
                    iconProps: {
                        iconName: 'Mail'
                    },
                    href: `mailto:${boundValue.raw}`
                }]
            }
            case 'SingleLine.Phone': {
                return [{
                    key: 'call',
                    disabled: disabled,
                    iconProps: {
                        iconName: 'Phone'
                    },
                    href: `tel:${boundValue.raw}`
                }]
            }
            case 'SingleLine.URL': {
                return [{
                    key: 'goToPage',
                    disabled: disabled,
                    iconProps: {
                        iconName: 'Globe'
                    },
                    target: '_blank',
                    href: boundValue.raw!
                }]
            }
        }
        return undefined;
    }

    const isTextArea = (() => {
        switch(parameters.value.type) {
            case DataTypes.Multiple:
            case DataTypes.SingleLineTextArea: {
                return true;
            }
        }
        return false;
    })()

    const componentProps = onOverrideComponentProps({
        readOnly: context.mode.isControlDisabled,
        resizable: false,
        type: getInputType(),
        multiline: isTextArea,
        autoFocus: parameters.AutoFocus?.raw,
        styles: {
            fieldGroup: {
                height: sizing.height,
                width: sizing.width
            }
        },
        errorMessage: boundValue.errorMessage,
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,
        suffixItems: getSuffixItems(),
        deleteButtonProps: parameters.EnableDeleteButton?.raw === true ? {
            key: 'delete',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Cancel'
            },
            onClick: () => setValue(undefined)
        } : undefined,
        clickToCopyProps: parameters.EnableCopyButton?.raw === true ? {
            key: 'copy',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Copy'
            }
        } : undefined,
        value: value ?? "",
        onBlur: () => {
            onNotifyOutputChanged({
                value: value ?? undefined
            });
        },
        onChange: (e, value) => {
            setValue(value);
        }
    })
    return (
        <ThemeProvider style={isTextArea ? { height: '100%' } : undefined} applyTo="none" theme={theme}>
            <TextFieldBase {...componentProps} />
        </ThemeProvider>
    );
};