import { TextField as TextFieldBase } from "@talxis/react-components";
import { useMemo, useRef } from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { ITextField, ITextFieldOutputs, ITextFieldParameters } from './interfaces';
import React from 'react';
import { ICommandBarItemProps } from '@fluentui/react';

export const TextField = (props: ITextField) => {
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);
    const { value, sizing, theme, setValue, onNotifyOutputChanged } = useInputBasedComponent<string | undefined, ITextFieldParameters, ITextFieldOutputs, any>('TextField', props);
    
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

    return (
        <TextFieldBase
            theme={theme}
            underlined={theme.effects.underlined}
            readOnly={context.mode.isControlDisabled}
            resizable={false}
            type={useMemo(() => getInputType(), [boundValue.type])}
            multiline={parameters.value.type === 'Multiple'}
            autoFocus={parameters.AutoFocus?.raw}
            elementRef={ref}
            styles={{
                fieldGroup: {
                    height: sizing.height,
                    width: sizing.width
                }
            }}
            borderless={parameters.EnableBorder?.raw === false}
            errorMessage={boundValue.errorMessage}
            hideErrorMessage={!parameters.ShowErrorMessage?.raw}
            suffixItems={useMemo(() => getSuffixItems(), [boundValue.raw, boundValue.error])}
            deleteButtonProps={parameters.EnableDeleteButton?.raw === true ? {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Delete'
                },
                onClick: () => setValue(undefined)
            } : undefined}
            clickToCopyProps={parameters.EnableCopyButton?.raw === true ? {
                key: 'copy',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Copy'
                }
            } : undefined}
            value={value ?? ""}
            onBlur={() => {
                onNotifyOutputChanged({
                    value: value ?? undefined
                });
            }}
            onChange={(e, value) => {
                setValue(value);
            }} />

    );
};