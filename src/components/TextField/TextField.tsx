import { TextField as TextFieldBase } from '@talxis/react-components/dist/components/TextField';
import { useRef } from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { ITextField, ITextFieldOutputs, ITextFieldParameters, ITextFieldTranslations } from './interfaces';
import React from 'react';
import { useTextFieldHeight } from './hooks/useTextField';

export const TextField = (props: ITextField) => {
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);
    const {value, sizing, setValue, onNotifyOutputChanged} = useInputBasedComponent<string | undefined, ITextFieldParameters, ITextFieldOutputs, ITextFieldTranslations>('TextField', props);
    const [height] = useTextFieldHeight(ref, sizing.height, props.parameters.IsMultiLine?.raw);

    return (
        <TextFieldBase
            readOnly={context.mode.isControlDisabled}
            //TODO: should be inherited by the type, eg TextArea = multiline
            multiline={parameters.IsMultiLine?.raw}
            resizable={parameters.isResizable?.raw}
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