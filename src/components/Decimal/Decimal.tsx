import { TextField } from "@talxis/react-components";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, { useRef } from 'react';
import { useDecimal } from "./hooks/useDecimal";
import numeral from 'numeral';

export const Decimal = (props: IDecimal) => {
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<string, IDecimalParameters, IDecimalOutputs>(props);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const ref = useRef<HTMLDivElement>(null);
    const [height] = useDecimal(props, ref);

    function extractNumericPart(str: string): number|undefined {
        // Replace commas with dots to ensure consistent decimal separators
        const normalizedStr = str.replace(/,/g, '.');
    
        // Extract the numeric part using a regular expression
        const numericPartMatch = normalizedStr.match(/[0-9]*\.?[0-9]+/);
    
        if (!numericPartMatch) {
            return 0; // Return NaN if no numeric part is found
        }
    
        // Use numeral to parse the numeric part and return the value
        return numeral(numericPartMatch[0]).value() || undefined;
    }
    return <TextField
    readOnly={context.mode.isControlDisabled}
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
            errorMessage={boundValue.error? boundValue.errorMessage : ''}
            value={value !=null ? value.toString() : undefined}
            onBlur={() => {
                onNotifyOutputChanged({
                    value: value !=null ? extractNumericPart(value) : undefined
                })
            }}
            onChange={(e, value) => {
                setValue(value ?? null);
            }} 
    />
}