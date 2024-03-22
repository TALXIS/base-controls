import { useEffect, useRef } from "react"
import deepEqual from 'fast-deep-equal';
import { IComponent, IBindings, IOutputs } from "../interfaces";

/**
 * Provides automatic checking if the given outputs are different from the provided inputs. Use the provided method any time you want
 * to notify the framework that you wish to write changes. The hook will notify the framework only if the provided output differs from the current inputs.
 */
export const useComponent = <TBindings extends IBindings, TOutputs extends IOutputs>(props: IComponent<TBindings, TOutputs>): [
    (outputs: TOutputs) => void
] => {
    const bindingsRef = useRef<TBindings>(props.bindings);

    useEffect(() => {
        bindingsRef.current = props.bindings;
    }, [props.bindings]);

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (const [key, outputValue] of Object.entries(outputs)) {
            const bindingValue = bindingsRef.current[key].raw
            if (!deepEqual(bindingValue, outputValue)) {
                isDirty = true;
            }
        }
        if (!isDirty) {
            return;
        }
        props.onNotifyOutputChanged?.(outputs);
    }
    return [onNotifyOutputChanged];
}