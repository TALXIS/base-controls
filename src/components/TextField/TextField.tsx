import { TextField as TextFieldBase } from '@talxis/react-components/dist/components/TextField';
import { useEffect, useRef } from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { useTextField } from './hooks/useTextField';
import { ITextField } from './interfaces';

export const TextField = (props: ITextField) => {
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent(props);
    const [height] = useTextField(props, ref);

    
    return (
        <TextFieldBase
            readOnly={context.mode.isControlDisabled}
            multiline={parameters.IsMultiLine?.raw}
            resizable={true}
            autoFocus={parameters.AutoFocus?.raw}
            elementRef={ref}
            styles={{
                fieldGroup: {
                    height: height,
                    width: context.mode.allocatedWidth || undefined
                }
            }}
            borderless={parameters.EnableBorder?.raw === false}
            errorMessage={boundValue.errorMessage}
            deleteButtonProps={parameters.EnableDeleteButton?.raw === true ? {
                key: 'delete',
                showOnlyOnHover: true,
                iconProps: {
                    iconName: 'Delete'
                },
                onClick: () => setValue(null)
            } : undefined}
            clickToCopyProps={parameters.EnableCopyButton?.raw === true ? {
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