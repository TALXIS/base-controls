import { TextField } from "@legacy";
import { useInputBasedControl } from "@hooks/useInputBasedControl";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, { useEffect, useMemo, useRef } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { ArrowButtons, IArrowButtons } from "./components/ArrowButtons";
import type { IParseNumberOptions } from "@talxis/client-libraries";

export const Decimal = (props: IDecimal) => {
    const arrowButtonsRef = useRef<IArrowButtons>(null);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
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

    const extractNumericPart = (value: any): number | undefined => {
        //TODO: investigate why this is needed
        if(value === initialFormattedValue) {
            return initialValue as number;
        }
        const dataType = props.parameters.value.type as IParseNumberOptions['dataType'];
        const result = context.formatting.parsing.number.parse({ value: value ?? '', dataType });
        //text that is not a number is sent up as it is, for the layer above to report
        return result.value as number;
    };

    const { value, sizing, setValue, onNotifyOutputChanged } = useInputBasedControl<string | undefined, IDecimalParameters, IDecimalOutputs, any>('Decimal', props, {
        formatter: formatter,
        valueExtractor: extractNumericPart
    });
    const initialFormattedValue = useMemo(() => value, []);
    const initialValue = useMemo(() => boundValue.raw, []);

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
        fillAvailableSpace: sizing.fillsAvailableSpace,
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
            <TextField {...componentProps} />
    );
};
