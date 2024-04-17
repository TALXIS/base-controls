import { TextField } from "@talxis/react-components/dist/components/TextField";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters, IDecimalTranslations } from "./interfaces";
import React, { useEffect } from "react";
import numeral from "numeral";
import { NumeralPCF } from "../../utils/NumeralPCF";

export const Decimal = (props: IDecimal) => {
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
        return context.formatting.formatInteger(parseInt(value as string));
    };

    const extractNumericPart = (str: any): number | undefined => {
        let regex;
        if (props.parameters.value.type === 'Decimal') {
            regex = new RegExp('^[' + '\\d' + numberFormatting.numberDecimalSeparator + numberFormatting.numberGroupSeparator + '\\s' + numberFormatting.negativeSign + ']+$');
        }
        else {
            regex = new RegExp('^[' + '\\d' + numberFormatting.numberGroupSeparator + '\\s' + numberFormatting.negativeSign + ']+$');

        }
        if (regex.test(str)) {
            numeral.locale('__pcfcustom');
            return numeral(str).value() ?? undefined;
        }
        return str;
    };

    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const numberFormatting = context.userSettings.numberFormattingInfo;
    
    useEffect(() => { NumeralPCF.register(numberFormatting); }, []);
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<string | undefined, IDecimalParameters, IDecimalOutputs, IDecimalTranslations>('Decimal', props, {
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
