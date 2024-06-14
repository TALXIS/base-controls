import { TextField } from "@talxis/react-components/dist/components/TextField";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters, IDecimalTranslations } from "./interfaces";
import React, { useEffect } from "react";
import numeral from "numeral";
import { Numeral } from "../../utils/Numeral";
import { CURRENCY_NEGATIVE_PATTERN, CURRENCY_POSITIVE_PATTERN, NUMBER_NEGATIVE_PATTERN } from "../../constants";

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
        if (props.parameters.value.type === 'Currency') {
            //the layer above has information about the symbol, so we can use the formatted string
            if(props.parameters.value.formatted) {
                return props.parameters.value.formatted;
            }
            if(typeof value === 'number') {
                return context.formatting.formatCurrency(value);
            }
        }
        return context.formatting.formatInteger(parseInt(value as string));
    };

    const createNumberPattern = (pattern: string, numberPattern: string) => {
        return new RegExp(`^${escapeRegExp(pattern).replace('n', numberPattern)}$`.replace(/\s/g, ''));
    };

    const createCurrencyPattern = (pattern: string, numberPattern: string) => {
        const escapedPattern = escapeRegExp(pattern);
        const escapedCurrencySymbolPattern = `(${escapeRegExp(numberFormatting.currencySymbol)})?`;
        const finalPattern = escapedPattern.replace('\\$', escapedCurrencySymbolPattern).replace('n', numberPattern);
        return new RegExp(`^${finalPattern.replace(/\s/g, '')}$`);
    };

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const extractNumericPart = (str: any): number | undefined => {
        // Currency control just sends the string up and lets the framework decide whether the value is correct
        // It only tries to parse the number based on the current user format
        // This means that the value will also pass if the user inputs his own currency even though
        // the currency is different on the field
        if(typeof str === 'number') {
            return str;
        }
        str = str?.replace(/\s/g, '');
        Numeral.decimal(numberFormatting);
        let positivePattern: any;
        let negativePattern: any;

        switch (props.parameters.value.type) {
            case 'Whole.None': {
                const numberPattern = `\\d{1,}(${numberFormatting.numberGroupSeparator}\\d{1,})*`;
                positivePattern = createNumberPattern('n', numberPattern);
                negativePattern = createNumberPattern(NUMBER_NEGATIVE_PATTERN[numberFormatting.numberNegativePattern], numberPattern);
                break;
            }
            case 'Decimal': {
                const numberPattern = `\\d{1,}(${numberFormatting.numberGroupSeparator}\\d{1,})*(\\${numberFormatting.numberDecimalSeparator}\\d+)?`;
                positivePattern = createNumberPattern('n', numberPattern);
                negativePattern = createNumberPattern(NUMBER_NEGATIVE_PATTERN[numberFormatting.numberNegativePattern], numberPattern);
                break;
            }
            case 'Currency': {
                Numeral.currency(numberFormatting);
                const numberPattern = `\\d{1,}(${numberFormatting.currencyGroupSeparator}\\d{1,})*(\\${numberFormatting.currencyDecimalSeparator}\\d+)?`;
                positivePattern = createCurrencyPattern(CURRENCY_POSITIVE_PATTERN[numberFormatting.currencyPositivePattern], numberPattern);
                negativePattern = createCurrencyPattern(CURRENCY_NEGATIVE_PATTERN[numberFormatting.currencyNegativePattern], numberPattern);
                break;
            }
        }
        if (positivePattern.test(str)) {
            return numeral(str).value() ?? undefined;
        }
        if (negativePattern.test(str)) {
            const value = numeral(str).value()!;
            if (value > 0) {
                return value * -1;
            }
            return value;
        }
        return str; // Return undefined if no numeric part is extracted
    };



    const { value, sizing, setValue, onNotifyOutputChanged } = useInputBasedComponent<string | undefined, IDecimalParameters, IDecimalOutputs, IDecimalTranslations>('Decimal', props, {
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
                    height: sizing.height,
                    width: sizing.width
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
