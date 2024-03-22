import { TextField as TextFieldBase } from '@talxis/react-components/dist/components/TextField';
import { useEffect, useRef } from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { useTextField } from './hooks/useTextField';
import { ITextField } from './interfaces';

export const TextField = (props: ITextField) => {
    const context = props.context;
    const bindings = props.bindings;
    const boundValue = bindings.value;
    const ref = useRef<HTMLDivElement>(null);
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent(props);
    const [height] = useTextField(props, ref);

    
    return (
        <TextFieldBase
            readOnly={context.mode.isControlDisabled}
            multiline={bindings.IsMultiLine?.raw}
            resizable={true}
            autoFocus={bindings.AutoFocus?.raw}
            elementRef={ref}
            styles={{
                fieldGroup: {
                    height: height,
                    width: context.mode.allocatedWidth || undefined
                }
            }}
            borderless={bindings.EnableBorder?.raw === false}
            errorMessage={boundValue.errorMessage}
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