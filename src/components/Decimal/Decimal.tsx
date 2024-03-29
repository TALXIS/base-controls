import { TextField  } from '@talxis/react-components/dist/components/TextField';
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, {useEffect, useRef } from 'react';
import numeral from 'numeral';

export const Decimal = (props: IDecimal) => {
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<string, IDecimalParameters, IDecimalOutputs>(props);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);

    function extractNumericPart(str: string): number|undefined {
        let formatedValue = numeral(str).value() || undefined;
        return formatedValue!;
    }

    function formatNumber():string{
        let numericValue = extractNumericPart(value!);
        if(numericValue){
            const formatedDecimalValue = context.formatting.formatDecimal(numericValue!,boundValue.attributes?.Precision);
            return context.formatting.formatInteger(+formatedDecimalValue);
        }else return value!;
    }

    useEffect(() => {
        setValue(formatNumber());
    }, []);
    
    return <TextField
    readOnly={context.mode.isControlDisabled}
            autoFocus={parameters.AutoFocus?.raw}
            elementRef={ref}
            borderless={parameters.EnableBorder?.raw === false}
            errorMessage={boundValue.error? boundValue.errorMessage : ''}
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
            value={value !=null ? value: undefined}
            
            onBlur={() => {
               let numericValue = extractNumericPart(value!);
               setValue(formatNumber());
                onNotifyOutputChanged({
                    value: value !=null ?numericValue!== undefined ? numericValue : +value  : undefined
                })
            }}
            onChange={(e, value) => {
                setValue(value ?? null);
            }} 
    />
}

