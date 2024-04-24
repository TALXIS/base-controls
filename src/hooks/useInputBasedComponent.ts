import { useEffect, useRef, useState } from "react";
import { IComponent, IOutputs, ITranslations } from "../interfaces/context";
import { useComponent } from "./useComponent";
import React from 'react';
import { IInputParameters } from "../interfaces/parameters";
import { StringProps } from "../types";

/**
 * Description
 * @param {any} value:any
 * @returns {any}
 */
interface IComponentOptions<TTranslations> {
    defaultTranslations?: TTranslations,
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
 * Second prop contains the translated string for this component
 * 
 * Third prop is a method that can be used to change the current value. The new value will get propagated to the `value` variable returned from this hook. This method wont propagate the value to the framework.
 * 
 * The last prop is a method that will notify the framework that you wish to write changes.  
 * The method will notify the framework only if the provided output differs from the current inputs.
 */

export const useInputBasedComponent = <TValue, TParameters extends IInputParameters, TOutputs extends IOutputs, TTranslations extends ITranslations>(name: string, props: IComponent<TParameters, TOutputs, TTranslations>, options?: IComponentOptions<TTranslations>): [
    TValue,
    Required<StringProps<TTranslations>>,
    (value: TValue) => void,
    (outputs: TOutputs) => void,
] => {
    const {formatter, valueExtractor} = {...options};
    const rawValue = props.parameters.value.raw;
    const [value, setValue] = useState<TValue>(formatter?.(rawValue) ?? rawValue);
    const valueRef = useRef<TValue>(rawValue);
    const [labels, onNotifyOutputChanged] = useComponent(name, props, options?.defaultTranslations);

    useEffect(() => {
        const formattedValue = formatter?.(rawValue);
        setValue(formattedValue ?? rawValue);
        console.log(`Updating component ${name} with new value: ${formattedValue ?? rawValue}`);
    }, [rawValue]);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    
    useEffect(() => {
        return () => {
            if(props.parameters.NotifyOutputChangedOnUnmount?.raw === true) {
                onNotifyOutputChanged({
                    value: valueExtractor?.(valueRef.current) ?? valueRef.current
                } as any);
            }
        };
    }, []);

    return [value, labels, setValue, onNotifyOutputChanged];

};