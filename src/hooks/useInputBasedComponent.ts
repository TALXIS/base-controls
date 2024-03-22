import { useEffect, useState } from "react";
import { IProperty } from "../interfaces";
import { IContext, IOutputs } from "../interfaces/context";
import { useComponent } from "./useComponent";

interface IInputs {
    value: IProperty
}
/**
 * Use when working with components that need to store value changes internally before triggering notifyOutputChanged.
 * An example of this is a standard Decimal component - we do not want to trigger notifyOutputChanged on every value change,
 * since this would trigger decimal validation on every keystroke which would result in a bad UX. In this case, the `notifyOutputChanged` should
 * be triggered when the user looses focus on the component (`onBlur` event).
 */
export const useInputBasedComponent = <TOutputs extends IOutputs>(context: IContext<IInputs, TOutputs>): [
    any,
    (value: any) => void,
    (outputs: TOutputs) => void
] => {
    const [value, setValue] = useState<string>();
    const [onNotifyOutputChanged] = useComponent(context as any);

    useEffect(() => {
        setValue(context.inputs.value.raw);
    }, [context.inputs]);

    return [value, setValue, onNotifyOutputChanged];

}