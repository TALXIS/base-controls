import { TextField  } from '@talxis/react-components/dist/components/TextField';
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, {useEffect, useRef } from 'react';
import numeral from 'numeral';

export const Decimal = (props: IDecimal) => {
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<number|string, IDecimalParameters, IDecimalOutputs>(props);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);
    function extractNumericPart(str:any): number|undefined {
        const regex = /^[\d,.\s]+$/;
        if (regex.test(str))
        {
        let formatedValue = numeral(str).value() || undefined;
        return formatedValue!;
        }else{

            return value as number;
        } 
            
    }

    useEffect(()=>{
        if(boundValue.raw){
            setValue(context.formatting.formatInteger(context.formatting.formatDecimal(boundValue.raw!,boundValue.attributes?.Precision)as unknown as number)as unknown as number);
        }
    },[]);

    return  <TextField
    readOnly={context.mode.isControlDisabled}
            autoFocus={parameters.AutoFocus?.raw}
            elementRef={ref}
            borderless={parameters.EnableBorder?.raw === false}
            errorMessage={boundValue.error? boundValue.errorMessage : '' }
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
            value={value != null ? value as unknown as string: undefined}
            
            onBlur={() => {

               let numericValue = extractNumericPart(value as string);
                onNotifyOutputChanged({
                    value: numericValue
                });
            }}
            onChange={(e, value) => {
                setValue(value ?? null);
            }} 
    />;
};
