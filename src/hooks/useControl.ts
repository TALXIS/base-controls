import { useEffect, useMemo, useRef } from "react";
import React from 'react';
import deepEqual from 'fast-deep-equal/es6';
import { IControl, IOutputs, IParameters } from "../interfaces";
import { merge } from 'merge-anything';
import { Liquid } from "liquidjs";
import { useControlTheme } from "./useControlTheme";
import { ITheme } from "../interfaces/theme";
import { useControlSizing } from "./useControlSizing";

export type ITranslation<T> = {
    [Property in keyof Required<T>]: (variables?: any) => string
};

export interface IDefaultTranslations {
    [LCID: number]: string | string[];
    [key: string]: any;
}


export interface IControlController<TTranslations, TOutputs> {
    labels: Required<ITranslation<TTranslations>>,
    sizing: {
        width?: number,
        height?: number
    },
    theme: ITheme;
    onNotifyOutputChanged: (outputs: TOutputs) => void,
}
/**
 * Provides automatic checking if the given outputs are different from the provided inputs. Use the provided method any time you want
 * to notify the framework that you wish to write changes. The hook will notify the framework only if the provided output differs from the current inputs.
 */
export const useControl = <TParameters extends IParameters, TOutputs extends IOutputs, TTranslations>(name: string, props: IControl<TParameters, TOutputs, TTranslations, any>, defaultTranslations?: IDefaultTranslations): IControlController<TTranslations, TOutputs> => {
    const parametersRef = useRef<TParameters>(props.parameters);
    const sizing = useControlSizing(props.context.mode);
    const context = props.context;
    const liquid = useMemo(() => new Liquid(), []);
    const labels = useMemo(() => {
        const mergedTranslations = merge(defaultTranslations ?? {}, props.translations ?? {}) as TTranslations;
        return new Proxy(mergedTranslations as any, {
            get(target, key) {
                return (variables: any) => getLabel(key as string, mergedTranslations, variables)
            }
        }) as any;
    }, []);

    useEffect(() => {
        parametersRef.current = props.parameters;
    }, [props.parameters]);

    const getLabel = (key: string, translations: TTranslations, variables?: any): string | string[] => {
        const strigify = (value: string | string[]) => {
            if (typeof value === 'string') {
                return value;
            }
            return JSON.stringify(value);
        };
        //@ts-ignore
        const translation = translations[key];
        if (!translation) {
            console.error(`Translation for the ${key} label of the ${name} control has not been defined!`);
            return key;
        }
        if (typeof translation === 'string' || Array.isArray(translation)) {
            return strigify(translation);
        }
        let label = translation[props.context.userSettings.languageId];
        if (!label) {
            console.info(`Translation for the ${key} label of the ${name} control has not been found. Using default Czech label instead.`);
            label = translation[1029];
        }
        if (!label) {
            console.error(`Translation for the ${key} label of the ${name} control does not exists neither for Czech language and current LCID.`);
            label = key;
        }

        return liquid.parseAndRenderSync(strigify(label), variables);
    };

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (let [key, outputValue] of Object.entries(outputs)) {
            let parameterValue = parametersRef.current[key]?.raw;
            if (!deepEqual(parameterValue, outputValue)) {
                if (outputValue === null) {
                    outputValue = undefined;
                    //@ts-ignore
                    outputs[key] = undefined;
                }
                if (outputValue === "") {
                    outputValue = undefined
                    //@ts-ignore
                    outputs[key] = undefined;
                }
                if (parameterValue === null) {
                    parameterValue = undefined;
                }
                if (parameterValue === outputValue) {
                    continue
                }
                isDirty = true;
                break;
            }
        }
        if (!isDirty) {
            return;
        }
        //console.log(`Change detected, triggering notifyOutputChanged on control ${name}.`);
        props.onNotifyOutputChanged?.(outputs);
    };
    return {
        labels,
        sizing,
        theme: useControlTheme(context.fluentDesignLanguage),
        onNotifyOutputChanged
    }
};
