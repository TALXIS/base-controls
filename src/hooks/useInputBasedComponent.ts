import { useEffect, useState } from "react";
import { IProperty } from "../interfaces";
import { IComponent, IOutputs } from "../interfaces/context";
import { useComponent } from "./useComponent";

interface IBindings {
    value: IProperty
}
/**
 * Use when working with components that need to store value changes internally before triggering `notifyOutputChanged`.
 * An example of this is a standard Decimal component - we do not want to trigger `notifyOutputChanged` on every value change,
 * since this would trigger decimal validation on every keystroke which would result in a bad UX. In this case, the `notifyOutputChanged` should
 * be triggered when the user looses focus on the component (`onBlur` event).
 * @returns {[]} The hook returns an array with three props. First `value` prop is a value that will will always be in sync with the value that comes from the `value` binding. 
 * Use this for displaying the up-to-date value to the user.
 * 
 * Second prop is a method that can be used to change the current value. The new value will get propagated to the `value` variable returned from this hook. This method wont propagate the value to the framework.
 * 
 * The last prop is a method that will notify the framework that you wish to write changes.  
 * The method will notify the framework only if the provided output differs from the current inputs.
 */

export const useInputBasedComponent = <TBindings extends IBindings, TOutputs extends IOutputs>(props: IComponent<TBindings, TOutputs>): [
    any,
    (value: any) => void,
    (outputs: TOutputs) => void
] => {
    const [value, setValue] = useState<string>();
    const [onNotifyOutputChanged] = useComponent(props as any);

    useEffect(() => {
        console.log('useEffect triggered');
        setValue(props.bindings.value.raw);
    }, [props.bindings.value.raw]);

    return [value, setValue, onNotifyOutputChanged];

}