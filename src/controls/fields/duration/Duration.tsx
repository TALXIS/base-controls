import { ComboBox } from "@legacy";
import { useEffect, useMemo, useRef } from 'react';
import { useInputBasedControl } from '@hooks/useInputBasedControl';
import { IDuration, IDurationOutputs, IDurationParameters } from './interfaces';
import { IComboBox, IComboBoxOption } from '@fluentui/react';
import { useLabels } from '@utils';
import { DURATION_LABELS } from './labels';
import { DEFAULT_DURATION_OPTIONS, WORKING_DAY_DURATION_OPTIONS } from "./durationOptions";

const splitWords = (words: string): string[] => words.split(',').map(word => word.trim());

export const Duration = (props: IDuration) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const componentRef = useRef<IComboBox>(null);
    const context = props.context;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const labels = useLabels(DURATION_LABELS);
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
        //the labels add abbreviations and forms the formatter does not write
        const result = context.formatting.parsing.duration.parse({
            value: str,
            hoursPerDay,
            labels: {
                minute: splitWords(labels.get('duration.minuteWords')),
                hour: splitWords(labels.get('duration.hourWords')),
                day: splitWords(labels.get('duration.dayWords')),
            },
        });
        return result.value;
    };

    const comboBoxOptions: IComboBoxOption[] = useMemo(() => {
        const defaultOptions = hoursPerDay === 8 ? WORKING_DAY_DURATION_OPTIONS : DEFAULT_DURATION_OPTIONS;
        const options: number[] = parameters.DurationOptions?.raw ? JSON.parse(parameters.DurationOptions.raw) : defaultOptions;
        return options.map(minutes => ({ key: minutes.toString(), text: formatter(minutes) ?? '' }));
    }, [parameters.DurationOptions?.raw, hoursPerDay]);

    const { value, sizing, setValue, onNotifyOutputChanged } = useInputBasedControl<string | null, IDurationParameters, IDurationOutputs>('Duration', props, {
        formatter: formatter,
        valueExtractor: valueExtractor,
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
                maxHeight: `300px !important`
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
        onChange: (e, option, index, freeText) => {
            onNotifyOutputChanged({
                //any is needed here because we can return string in case of error values
                value: valueExtractor(option?.text ?? freeText ?? '') as any
            });
            //a duration picked from the list is the whole of the input: the editor has nothing left to take
            parameters.Cell?.raw?.finishEditing();
        }
    });

    return (
        <ComboBox {...componentProps} />
    );
};