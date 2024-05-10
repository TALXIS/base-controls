import { TextField } from "@talxis/react-components/dist/components/TextField";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters, IDecimalTranslations } from "./interfaces";
import React, { useEffect } from "react";
import numeral from "numeral";
import { NumeralPCF } from "../../utils/NumeralPCF";

export const Decimal = (props: IDecimal) => {
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const numberFormatting = context.userSettings.numberFormattingInfo;

    const formatter = (value: string | number | null): string | undefined => {
        if (value == null) {
            return undefined;
        }
        if (isNaN(value as number)) {
            return value as string;
        }
        if (props.parameters.value.type === 'Decimal') {
            return context.formatting.formatDecimal(parseFloat(value as string), boundValue.attributes?.Precision);
        }
        if(props.parameters.value.type === 'Currency') {
            return props.parameters.value.formatted;
        }
        return context.formatting.formatInteger(parseInt(value as string));
    };

    const extractNumericPart = (str: any): number | undefined => {
        //currency control just sends the string up and lets the framework decide whether the value is correct
        //it only tries to parse the number based on the current user format
        //this means that the value will also pass if the user inputs his own currency even though
        //the currency is different on the field
        let regex;
        NumeralPCF.decimal(numberFormatting)
        if (props.parameters.value.type === 'Decimal') {
            regex = new RegExp('^[' + '\\d' + numberFormatting.numberDecimalSeparator + numberFormatting.numberGroupSeparator + '\\s' + numberFormatting.negativeSign + ']+$');
        }
        if (props.parameters.value.type === 'Currency') {
            NumeralPCF.currency(numberFormatting)
            regex = new RegExp('^\\s*\\$?\\s*[' + '\\d' + numberFormatting.currencyDecimalSeparator + numberFormatting.currencyGroupSeparator + '\\s' + numberFormatting.currencyNegativePattern + ']+\\s*\\$?\\s*$');
        }
        else {
            regex = new RegExp('^[' + '\\d' + numberFormatting.numberGroupSeparator + '\\s' + numberFormatting.negativeSign + ']+$');
        }
        if (regex.test(str)) {
            return numeral(str).value() ?? undefined;
        }
        return str;
    };
    
    const [value, labels, setValue, onNotifyOutputChanged] = useInputBasedComponent<string | undefined, IDecimalParameters, IDecimalOutputs, IDecimalTranslations>('Decimal', props, {
        formatter: formatter,
        valueExtractor: extractNumericPart
    });

    return (
        <TextField
            readOnly={context.mode.isControlDisabled}
            autoFocus={parameters.AutoFocus?.raw}
            borderless={parameters.EnableBorder?.raw === false}
            errorMessage={boundValue.errorMessage}
            styles={{
                fieldGroup: {
                    height: context.mode.allocatedHeight || undefined,
                    width: context.mode.allocatedWidth || undefined
                }
            }}
            deleteButtonProps={
                parameters.EnableDeleteButton?.raw === true
                    ? {
                        key: "delete",
                        showOnlyOnHover: true,
                        iconProps: {
                            iconName: "Delete",
                        },
                        onClick: () => setValue(undefined),
                    }
                    : undefined
            }
            clickToCopyProps={
                parameters.EnableCopyButton?.raw === true
                    ? {
                        key: "copy",
                        showOnlyOnHover: true,
                        iconProps: {
                            iconName: "Copy",
                        },
                    }
                    : undefined
            }
            value={value ?? ""}
            onBlur={(event) => {
                onNotifyOutputChanged({
                    value: extractNumericPart(event.target.value)
                });
            }}
            onChange={(e, value) => {
                setValue(value);
            }}
        />
    );
};
