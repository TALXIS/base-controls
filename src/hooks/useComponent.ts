import { useEffect, useRef, useState } from "react"
import deepEqual from 'fast-deep-equal';
import { IContext, IInputs, IOutputs } from "../interfaces/context";

/**
 * Provides automatic checking if the given outputs are different from the provided inputs. Use the provided `onNotifyOutputChaged` method any time you want
 * to notify the framework that you wish to write changes. The hook will notify the framework only if the provided output differs from the current inputs.
 */
export const useComponent = <TInputs extends IInputs, TOutputs extends IOutputs>(context: IContext<TInputs, TOutputs>): [
    (outputs: TOutputs) => void
] => {
    const inputsRef = useRef<TInputs>(context.inputs);

    useEffect(() => {
        inputsRef.current = context.inputs;
    }, [context.inputs]);

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (const [key, value] of Object.entries(outputs)) {
            const inputValue = inputsRef.current[key].raw
            if (!deepEqual(value, inputValue)) {
                isDirty = true;
            }
        }
        if (!isDirty) {
            return;
        }
        context.onNotifyOutputChanged?.(outputs);
    }
    return [onNotifyOutputChanged];
}