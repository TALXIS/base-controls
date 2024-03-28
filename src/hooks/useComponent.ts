import { useEffect, useRef } from "react";
import React from 'react';
import deepEqual from 'fast-deep-equal';
import { IComponent, IOutputs, IParameters } from "../interfaces";

/**
 * Provides automatic checking if the given outputs are different from the provided inputs. Use the provided method any time you want
 * to notify the framework that you wish to write changes. The hook will notify the framework only if the provided output differs from the current inputs.
 */
export const useComponent = <TParameters extends IParameters, TOutputs extends IOutputs>(props: IComponent<TParameters, TOutputs>): [
    (outputs: TOutputs) => void
] => {
    const parametersRef = useRef<TParameters>(props.parameters);

    useEffect(() => {
        parametersRef.current = props.parameters
    }, [props.parameters]);

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (const [key, outputValue] of Object.entries(outputs)) {
            const parameterValue = parametersRef.current[key]?.raw
            if (!deepEqual(parameterValue, outputValue)) {
                // handles undefined X null
                if(parameterValue == outputValue) {
                    continue
                }
                isDirty = true;
                break;
            }
        }
        if (!isDirty) {
            return;
        }
        console.log('Change detected, triggering notifyOutputChanged')
        props.onNotifyOutputChanged?.(outputs);
    }
    return [onNotifyOutputChanged];
}