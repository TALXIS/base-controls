import { TextField } from "@talxis/react-components/dist/components/TextField";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
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
        return context.formatting.formatDecimal(parseFloat(value as string), boundValue.attributes?.Precision);
    };

    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const numberFormatting = context.userSettings.numberFormattingInfo;
    useEffect(() => {NumeralPCF.register(numberFormatting);}, []);
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<string | undefined, IDecimalParameters, IDecimalOutputs>(props, formatter);

    const extractNumericPart = (str: any): number | undefined => {
        const _a = new RegExp('^[' + '\\d' + numberFormatting.numberDecimalSeparator + numberFormatting.numberGroupSeparator + '\\s' + numberFormatting.negativeSign + ']+$');
        if (_a.test(str)) {
            numeral.locale('__pcfcustom');
            return numeral(str).value() ?? undefined;
        }
        return str;
    };

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
                let numericValue = extractNumericPart(event.target.value);
                console.log(numericValue);
                onNotifyOutputChanged({
                    value: numericValue,
                });
            }}
            onChange={(e, value) => {
                setValue(value);
            }}
        />
    );
};
