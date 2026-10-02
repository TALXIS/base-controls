import { ComboBox } from "@legacy";
import { useEffect, useMemo, useRef } from 'react';
import { useInputBasedControl } from '@hooks/useInputBasedControl';
import { IDuration, IDurationOutputs, IDurationParameters } from './interfaces';
import { IComboBox, IComboBoxOption } from '@fluentui/react';
import { getDefaultDurationTranslations } from './translations';
import { durationOptions } from "./durationOptions";

export const Duration = (props: IDuration) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const componentRef = useRef<IComboBox>(null);
    const context = props.context;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const hoursPerDay = typeof parameters.HoursPerDay?.raw === 'number' && parameters.HoursPerDay.raw > 0 ? parameters.HoursPerDay.raw : 24;

    const formatter = (value: number | null) => {
        if (typeof value === 'number') {
            return context.formatting.formatDuration(value, hoursPerDay);
        }
        return value;
    };

    const valueExtractor = (str: string | null): number | undefined | string => {
        if (initialFormattedValue === str) {
            return boundValue.raw as number;
        }
        if (!str?.trim()) {
            return undefined;
        }
        //the translations add abbreviations and forms the formatter does not write
        const result = context.formatting.parsing.duration.parse({
            value: str,
            hoursPerDay,
            labels: {
                minute: [...JSON.parse(labels.minute()), ...JSON.parse(labels.minutes())],
                hour: [...JSON.parse(labels.hour()), ...JSON.parse(labels.hours())],
                day: [...JSON.parse(labels.day()), ...JSON.parse(labels.days())],
            },
        });
        return result.value;
    };

    const presetOptions = (): IComboBoxOption[] => {
        const formattedOptions = durationOptions.map(option => ({
            key: option.Value.toString(),
            text: formatter(parseInt(option.Label)) ?? "",
        }));
        return formattedOptions;
    };

    const comboBoxOptions: IComboBoxOption[] = presetOptions();

    const { value, labels, sizing, setValue, onNotifyOutputChanged } = useInputBasedControl<string | null, IDurationParameters, IDurationOutputs, Required<IDuration>['translations']>('Duration', props, {
        formatter: formatter,
        valueExtractor: valueExtractor,
        defaultTranslations: getDefaultDurationTranslations(),
    });

    const initialFormattedValue = useMemo(() => value, [])

    useEffect(() => {
        if (parameters.AutoFocus?.raw) {
            componentRef.current?.focus(true);
        }
    }, []);

    const componentProps = onOverrideComponentProps({
        componentRef,
        options: comboBoxOptions,
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,

        allowFreeInput: true,
        autoComplete: 'on',
        autofill: parameters.AutoFocus?.raw === true ? { autoFocus: true } : undefined,
        readOnly: context.mode.isControlDisabled,
        useComboBoxAsMenuWidth: true,
        fillAvailableSpace: sizing.fillsAvailableSpace,
        errorMessage: boundValue.errorMessage,
        text: value ?? '',
        styles: {
            root: {
                height: sizing.height,
                width: sizing.width,
                display: 'flex',
                alignItems: 'center',
            },
            callout: {
                height: 300
            }
        },
        onInputValueChange: (text) => {
            setValue(text ?? '');
        },
        onBlur: (event) => {
            onNotifyOutputChanged({
                //any is needed here because we can return string in case of error values
                value: valueExtractor(value) as any
            });
        },
        onChange: (e, value) => {
            onNotifyOutputChanged({
                //any is needed here because we can return string in case of error values
                value: valueExtractor(value?.text ?? '') as any
            });
            //a duration picked from the list is the whole of the input: the editor has nothing left to take
            parameters.Cell?.raw?.finishEditing();
        }
    });

    return (
        <ComboBox {...componentProps} />
    );
};