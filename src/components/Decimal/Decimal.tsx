import { TextField  } from '@talxis/react-components/dist/components/TextField';
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, {useEffect, useRef } from 'react';
import numeral from 'numeral';

export const Decimal = (props: IDecimal) => {
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<string|number, IDecimalParameters, IDecimalOutputs>(props);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);

    function extractNumericPart(str:any): number|undefined {
        let formatedValue = numeral(str).value() || undefined;
        return formatedValue!;
    }

    useEffect(() => {
        // Extract numeric part and send it via onNotifyOutputChanged when value changes
        const numericValue = extractNumericPart(boundValue.raw);
        onNotifyOutputChanged({
            value: numericValue !== undefined ? numericValue : boundValue.raw ?? undefined
        });
    }, [boundValue.raw, onNotifyOutputChanged]);

    useEffect(()=>{
        const numericValue=extractNumericPart(value);
        if (numericValue){
         setValue(context.formatting.formatInteger(context.formatting.formatDecimal(+numericValue,boundValue.attributes?.Precision)as unknown as number)as unknown as number);
        }else setValue(value);
    },[]);

    return <TextField
    readOnly={context.mode.isControlDisabled}
            autoFocus={parameters.AutoFocus?.raw}
            elementRef={ref}
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
            value={value != null ? value as string: undefined}
            
            onBlur={() => {
               let numericValue = extractNumericPart(value!);
                onNotifyOutputChanged({
                    value: value !=null ?numericValue!== undefined ? numericValue : value as number  : undefined
                })
            }}
            onChange={(e, value) => {
                setValue(value ?? null);
            }} 
    />
}

