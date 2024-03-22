import React from 'react';
import { TextField } from '@talxis/react-components/dist/components/TextField';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { ISingleLineText } from './interfaces';
import { useComponent } from '../../hooks';

export const SingleLineText = (props: ISingleLineText) => {
    const context = props.context;
    const bindings = props.bindings;
    const boundValue = bindings.value;
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent(props);
    
    return (
        <TextField
            readOnly={context.mode.isControlDisabled}
            autoFocus={bindings.AutoFocus?.raw}
            styles={{
                fieldGroup: {
                    height: context.mode?.allocatedHeight || undefined
                }
            }}
            width={context.mode.allocatedWidth || 0}
            borderless={bindings.EnableBorder?.raw === false}
            errorMessage={boundValue.errorMessage}
            maxLength={boundValue.attributes?.MaxLength}
            deleteButtonProps={bindings.EnableDeleteButton?.raw === true ? {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Delete'
                },
                onClick: () => setValue(null)
            } : undefined}
            clickToCopyProps={bindings.EnableCopyButton?.raw === true ? {
                key: 'copy',
                iconProps: {
                    iconName: 'Copy'
                }
            } : undefined}
            value={value}
            onBlur={() => {
                onNotifyOutputChanged({
                    value: value
                })
            }}
            onChange={(e, value) => {
                setValue(value)
            }} />

    )
}