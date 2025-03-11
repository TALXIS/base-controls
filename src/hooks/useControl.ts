import { useEffect, useRef } from "react";
import { IControl, IOutputs, IParameters } from "../interfaces";
import { useControlTheme } from "../utils/theme/hooks/useControlTheme";
import { useControlSizing } from "./useControlSizing";
import deepEqual from 'fast-deep-equal/es6';
import { ITheme } from "@talxis/react-components";
import dayjs from "dayjs";
import { IDefaultTranslations, ITranslation, useControlLabels } from "./useControlLabels";

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
    const context = props.context;
    const parametersRef = useRef<TParameters>(props.parameters);
    const sizing = useControlSizing(props.context.mode);
    const labels = useControlLabels({
        languageId: context.userSettings.languageId,
        translations: props.translations,
        defaultTranslations
    });

    useEffect(() => {
        parametersRef.current = props.parameters;
    }, [props.parameters]);

    const onNotifyOutputChanged = (outputs: TOutputs) => {
        let isDirty = false;
        for (let [key, outputValue] of Object.entries(outputs)) {
            let parameterValue = parametersRef.current[key]?.raw;
            if(parameterValue instanceof Date) {
                parameterValue = dayjs(parameterValue).startOf('minute').toDate();
            }
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
