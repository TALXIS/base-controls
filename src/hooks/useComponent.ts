import { useEffect, useMemo, useRef } from "react";
import React from 'react';
import deepEqual from 'fast-deep-equal';
import { IComponent, IOutputs, IParameters, ITranslations } from "../interfaces";
import { merge } from 'merge-anything'



/**
 * Provides automatic checking if the given outputs are different from the provided inputs. Use the provided method any time you want
 * to notify the framework that you wish to write changes. The hook will notify the framework only if the provided output differs from the current inputs.
 */
export const useComponent = <TParameters extends IParameters, TOutputs extends IOutputs, TTranslations extends ITranslations>(name: string, props: IComponent<TParameters, TOutputs, TTranslations>, defaultTranslations?: TTranslations): [
    (outputs: TOutputs) => void,
    (key: string) => string,
] => {
    const parametersRef = useRef<TParameters>(props.parameters);
    const labels = useMemo(() => {
        if(!defaultTranslations && !props.translations) {
            return {} as TTranslations;
        }
        return merge(defaultTranslations ?? {}, props.translations ?? {} ) as TTranslations;
    }, []);
    console.log(labels)

    useEffect(() => {
        parametersRef.current = props.parameters;
    }, [props.parameters]);

    const getLabel = (key: string): string => {
        const translation = labels[key];
        if(!translation) {
            throw new Error(`Missing translation for ${key} label of ${name} component!`);
        }
        if(typeof translation === 'string') {
            return translation;
        }
        let label = translation[props.context.userSettings.languageId];
        if(!label) {
            console.info(`Translation for the ${label} label of the ${name} component has not been found. Using default Czech label instead.`);
            label = translation[1029];
        }
        if(!label) {
            throw new Error(`Translation for the ${label} of the ${name} component does not exists neither for Czech language and current LCID.`)
        }
        return label
    }

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (const [key, outputValue] of Object.entries(outputs)) {
            const parameterValue = parametersRef.current[key]?.raw;
            if (!deepEqual(parameterValue, outputValue)) {
                // handles undefined X null
                if(parameterValue == outputValue) {
                    continue;
                }
                isDirty = true;
                break;
            }
        }
        if (!isDirty) {
            return;
        }
        console.log('Change detected, triggering notifyOutputChanged');
        props.onNotifyOutputChanged?.(outputs);
    };
    return [onNotifyOutputChanged, getLabel];
};