import React from 'react';
import { TextField } from '@talxis/react-components/dist/components/TextField';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { ISingleLineText } from './interfaces';
import { useComponent } from '../../hooks';

export const SingleLineText = (props: ISingleLineText) => {
    const binding = props.inputs.value;
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent(props);
    console.log(props);
    
    return (
        <TextField
            readOnly={props.mode?.isControlDisabled}
            autoFocus={props.AutoFocus?.raw}
            styles={{
                fieldGroup: {
                    height: props.mode?.allocatedHeight ?? undefined
                }
            }}
            width={props.mode?.allocatedWidth}
            borderless={props.EnableBorder?.raw === false}
            errorMessage={binding.errorMessage}
            maxLength={binding.attributes?.MaxLength}
            deleteButtonProps={props.EnableDeleteButton?.raw === true ? {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Delete'
                },
                onClick: () => setValue(null)
            } : undefined}
            clickToCopyProps={props.EnableCopyButton?.raw === true ? {
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