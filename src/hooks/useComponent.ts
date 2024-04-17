import { useEffect, useMemo, useRef } from "react";
import React from 'react';
import deepEqual from 'fast-deep-equal';
import { IComponent, IOutputs, IParameters, ITranslations } from "../interfaces";
import { merge } from 'merge-anything';
import { StringProps } from "../types";


/**
 * Provides automatic checking if the given outputs are different from the provided inputs. Use the provided method any time you want
 * to notify the framework that you wish to write changes. The hook will notify the framework only if the provided output differs from the current inputs.
 */
export const useComponent = <TParameters extends IParameters, TOutputs extends IOutputs, TTranslations extends ITranslations>(name: string, props: IComponent<TParameters, TOutputs, TTranslations>, defaultTranslations?: TTranslations): [
    Required<StringProps<TTranslations>>,
    (outputs: TOutputs) => void,
] => {
    const parametersRef = useRef<TParameters>(props.parameters);
    const labels = useMemo(() => {
        const mergedTranslations = structuredClone(merge(defaultTranslations ?? {}, props.translations ?? {}) as TTranslations);
        return new Proxy(mergedTranslations, {
            get(target, key) {
                return getLabel(key as string, mergedTranslations);
            }
        }) as any;
    }, []);
    console.log(labels)

    useEffect(() => {
        parametersRef.current = props.parameters;
    }, [props.parameters]);

    const getLabel = (key: string, translations: TTranslations): string | string[] => {
        const translation = translations[key];
        if (!translation) {
            console.error(`Translation for the ${key} label of the ${name} component has not been defined!`);
            return key;
        }
        if (typeof translation === 'string') {
            return translation;
        }
        let label = translation[props.context.userSettings.languageId];
        if (!label) {
            console.info(`Translation for the ${key} label of the ${name} component has not been found. Using default Czech label instead.`);
            label = translation[1029];
        }
        if (!label) {
            console.error(`Translation for the ${key} label of the ${name} component does not exists neither for Czech language and current LCID.`);
            label = key;
        }
        return label
    }

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (const [key, outputValue] of Object.entries(outputs)) {
            const parameterValue = parametersRef.current[key]?.raw;
            if (!deepEqual(parameterValue, outputValue)) {
                // handles undefined X null
                if (parameterValue == outputValue) {
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
    return [labels, onNotifyOutputChanged];
};