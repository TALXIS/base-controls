import { useEffect, useRef, useState } from "react";
import { IControl, IOutputs } from "../interfaces/context";
import { IControlController, useControl } from "./useControl";
import { IInputParameters } from "../interfaces/parameters";
import { IDefaultTranslations } from "./useControlLabels";
import deepEqual from 'fast-deep-equal/es6';

interface IControlOptions {
    defaultTranslations?: IDefaultTranslations;
    /**
     * Formatting function that will format the bound value every time a new one comes from the props.
     */
    formatter?: (value: any) => any,
    valueExtractor?: (value: any) => any
}

/**
 * Use when working with components that need to store value changes internally before triggering `notifyOutputChanged`.
 * An example of this is a standard Decimal component - we do not want to trigger `notifyOutputChanged` on every value change,
 * since this would trigger decimal validation on every keystroke which would result in a bad UX. In this case, the `notifyOutputChanged` should
 * be triggered when the user looses focus on the component (`onBlur` event).
 * @returns {[]} The hook returns an array with three props. First `value` prop is a value that will will always be in sync with the value that comes from the `value` parameter. 
 * Use this for displaying the up-to-date value to the user.
 * Second prop contains the translations for this component.
 * 
 * Third prop is a method that can be used to change the current value. The new value will get propagated to the `value` variable returned from this hook. This method wont propagate the value to the framework.
 * 
 * The last prop is a method that will notify the framework that you wish to write changes.  
 * The method will notify the framework only if the provided output differs from the current inputs.
 * Unmounting notifies the current value unless it is the one notified last.
 */

interface IInputBasedControlController<TValue, TTranslations, TOutputs> extends IControlController<TTranslations, TOutputs> {
    value: TValue,
    setValue: (value: TValue) => void
}

export const useInputBasedControl = <TValue, TParameters extends IInputParameters, TOutputs extends IOutputs, TTranslations>(name: string, props: IControl<TParameters, TOutputs, TTranslations, any>, options?: IControlOptions): IInputBasedControlController<TValue, TTranslations, TOutputs> => {
    const { formatter, valueExtractor } = { ...options };
    const rawValue = props.parameters.value.raw;
    const [value, setValue] = useState<TValue>(formatter?.(rawValue) ?? rawValue);
    const valueRef = useRef<TValue>(rawValue);
    const lastNotifiedRef = useRef<{ value: any }>();
    const { labels, sizing, theme, className, onNotifyOutputChanged: notifyControl } = useControl(name, props, options?.defaultTranslations);

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        lastNotifiedRef.current = { value: outputs.value };
        notifyControl(outputs);
    };

    useEffect(() => {
        const formattedValue = formatter?.(rawValue);
        setValue(formattedValue ?? rawValue);
    }, [rawValue]);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        return () => {
            const value = valueExtractor?.(valueRef.current) ?? valueRef.current;
            //a grid editor unmounts right after its blur, before a re-render refreshes the inputs
            //useControl compares against, so without this the blurred value is written twice
            if (lastNotifiedRef.current && deepEqual(lastNotifiedRef.current.value, value)) {
                return;
            }
            notifyControl({ value } as any);
        };
    }, []);
    return {
        className: className,
        value,
        labels,
        sizing,
        theme,
        onNotifyOutputChanged,
        setValue
    }
};