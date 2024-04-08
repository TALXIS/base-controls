import { useEffect, useRef, useState } from "react";
import { IProperty } from "../interfaces";
import { IComponent, IOutputs } from "../interfaces/context";
import { useComponent } from "./useComponent";
import React from 'react';
import { IInputParameters } from "../interfaces/parameters";

/**
 * Use when working with components that need to store value changes internally before triggering `notifyOutputChanged`.
 * An example of this is a standard Decimal component - we do not want to trigger `notifyOutputChanged` on every value change,
 * since this would trigger decimal validation on every keystroke which would result in a bad UX. In this case, the `notifyOutputChanged` should
 * be triggered when the user looses focus on the component (`onBlur` event).
 * @returns {[]} The hook returns an array with three props. First `value` prop is a value that will will always be in sync with the value that comes from the `value` parameter. 
 * Use this for displaying the up-to-date value to the user.
 * 
 * Second prop is a method that can be used to change the current value. The new value will get propagated to the `value` variable returned from this hook. This method wont propagate the value to the framework.
 * 
 * The last prop is a method that will notify the framework that you wish to write changes.  
 * The method will notify the framework only if the provided output differs from the current inputs.
 */

export const useInputBasedComponent = <TValue, TParameters extends IInputParameters, TOutputs extends IOutputs>(props: IComponent<TParameters, TOutputs>, formatter?: (value: any) => any): [
    TValue,
    (value: TValue) => void,
    (outputs: TOutputs) => void
] => {
    const rawValue = props.parameters.value.raw;
    const [value, setValue] = useState<TValue>(rawValue);
    const valueRef = useRef<TValue>(rawValue);
    const [onNotifyOutputChanged] = useComponent(props as any);

    useEffect(() => {
        const formattedValue = formatter?.(rawValue);
        setValue(formattedValue ?? rawValue);
        console.log(`Updating the component with new value: ${formattedValue ?? rawValue}`);
    }, [rawValue]);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    
    useEffect(() => {
        return () => {
            if(props.parameters.NotifyOutputChangedOnUnmount?.raw === true) {
                onNotifyOutputChanged({
                    value: valueRef.current
                });
            }
        };
    }, []);

    return [value, setValue, onNotifyOutputChanged];

};