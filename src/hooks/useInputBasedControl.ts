import { useEffect, useRef, useState } from "react";
import { IControl, IOutputs } from "../interfaces/context";
import { IControlController, IDefaultTranslations, useControl } from "./useControl";
import { IInputParameters } from "../interfaces/parameters";

/**
 * Description
 * @param {any} value:any
 * @returns {any}
 */
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
    const { labels, sizing, theme, onNotifyOutputChanged } = useControl(name, props, options?.defaultTranslations);

    useEffect(() => {
        const formattedValue = formatter?.(rawValue);
        setValue(formattedValue ?? rawValue);
        //console.log(`Updating component ${name} with new value: ${formattedValue ?? rawValue}`);
    }, [rawValue]);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        return () => {
            onNotifyOutputChanged({
                value: valueExtractor?.(valueRef.current) ?? valueRef.current
            } as any);
        };
    }, []);
    return {
        value,
        labels,
        sizing,
        theme,
        onNotifyOutputChanged,
        setValue
    }
};