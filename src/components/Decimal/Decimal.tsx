import { TextField } from "@talxis/react-components";
import { useInputBasedControl } from "../../hooks/useInputBasedControl";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, { useEffect, useMemo, useRef } from "react";
import numeral from "numeral";
import { CURRENCY_NEGATIVE_PATTERN, CURRENCY_POSITIVE_PATTERN, NUMBER_NEGATIVE_PATTERN } from "../../constants";
import { ICommandBarItemProps, ThemeProvider } from "@fluentui/react";
import { ArrowButtons, IArrowButtons } from "./components/ArrowButtons";
import { Numeral } from "@talxis/client-libraries";

export const Decimal = (props: IDecimal) => {
    const arrowButtonsRef = useRef<IArrowButtons>(null);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const numberFormatting = context.userSettings.numberFormattingInfo;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);

    const formatter = (value: string | number | null): string | undefined | null => {
        if (typeof value === 'number') {
            if (props.parameters.value.type === 'Decimal') {
                return context.formatting.formatDecimal(value, boundValue.attributes?.Precision);
            }
            if (props.parameters.value.type === 'Currency') {
                //the layer above has information about the symbol, so we can use the formatted string
                if (props.parameters.value.formatted) {
                    return props.parameters.value.formatted;
                }
                return context.formatting.formatCurrency(value, boundValue.attributes?.Precision);
            }
            return context.formatting.formatInteger(value);
        }
        return value;
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

    const extractNumericPart = (value: any): number | undefined => {
        // Currency control just sends the string up and lets the framework decide whether the value is correct
        // It only tries to parse the number based on the current user format
        // This means that the value will also pass if the user inputs his own currency even though
        // the currency is different on the field
        if (typeof value === 'number') {
            return value
        }
        if(value === initialFormattedValue) {
            return boundValue.raw as number;
        }
        const str = value?.replace(/\s/g, '');
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
        return value;
    };

    const { value, sizing, theme, setValue, onNotifyOutputChanged } = useInputBasedControl<string | undefined, IDecimalParameters, IDecimalOutputs, any>('Decimal', props, {
        formatter: formatter,
        valueExtractor: extractNumericPart
    });
    const initialFormattedValue = useMemo(() => value, []);

    const getSuffixItems = (): ICommandBarItemProps[] | undefined => {
        if (context.mode.isControlDisabled || !parameters.EnableSpinButton?.raw) {
            return undefined;
        }
        return [
            {
                key: 'arrows',
                onRender: () => <ArrowButtons
                    ref={arrowButtonsRef}
                    onDecrement={() => makeStep('decrement')}
                    onIncrement={() => makeStep('increment')} />
            }
        ]
    }

    const makeStep = (type: 'increment' | 'decrement') => {
        const value = boundValue.raw ?? 0;
        if (typeof value !== 'number') {
            return;
        }
        const precision = Math.pow(10, boundValue.attributes?.Precision ?? 0);
        const adjustment = type === 'increment' ? 1 : -1;
        const newValue = parseFloat(((value) + adjustment / precision).toFixed(boundValue.attributes?.Precision ?? 0));
        onNotifyOutputChanged({ value: newValue });

    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (context.mode.isControlDisabled) {
            return;
        }
        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                makeStep('decrement');
                arrowButtonsRef.current?.setActiveBtn('down');
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                makeStep('increment');
                arrowButtonsRef.current?.setActiveBtn('up');
                break;
            }
        }
    }

    const getInputMode = () => {
        switch (props.parameters.value.type) {
            case 'Whole.None': {
                return 'numeric';
            }
            case 'Decimal':
            case 'Currency': {
                return 'decimal';
            }
        }
    }
    useEffect(() => {
        if (boundValue.type === 'Currency') {
            setValue(boundValue.formatted);
        }
    }, [boundValue.formatted]);

    const componentProps = onOverrideComponentProps({
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,
        readOnly: context.mode.isControlDisabled,
        inputMode: useMemo(() => getInputMode(), [props.parameters.value.type]),
        suffixItems: getSuffixItems(),
        autoFocus: parameters.AutoFocus?.raw,
        errorMessage: boundValue.errorMessage,
        styles: {
            fieldGroup: {
                height: sizing.height,
                width: sizing.width
            }
        },
        deleteButtonProps: parameters.EnableDeleteButton?.raw === true
            ? {
                key: "delete",
                showOnlyOnHover: true,
                iconProps: {
                    iconName: "Cancel",
                },
                onClick: () => setValue(undefined),
            }
            : undefined,
        clickToCopyProps: parameters.EnableCopyButton?.raw === true
            ? {
                key: "copy",
                showOnlyOnHover: true,
                iconProps: {
                    iconName: "Copy",
                },
            }
            : undefined,
        value: value ?? "",
        onBlur: (event) => {
            onNotifyOutputChanged({
                value: extractNumericPart(event.target.value)
            });
        },
        onChange: (e, value) => {
            setValue(value);
        },
        onKeyDown: onKeyDown,
    });
    return (
        <ThemeProvider theme={theme} applyTo="none">
            <TextField {...componentProps} />
        </ThemeProvider>
    );
};
