import { ComboBox } from "@talxis/react-components";
import { useEffect, useMemo, useRef } from 'react';
import { useInputBasedControl } from '../../hooks/useInputBasedControl';
import { IDuration, IDurationOutputs, IDurationParameters } from './interfaces';
import { IComboBox, IComboBoxOption, ThemeProvider } from '@fluentui/react';
import numeral from "numeral";
import { getDefaultDurationTranslations } from './translations';
import { durationOptions } from "./durationOptions";
import humanizeDuration, { HumanizerOptions, Unit } from "humanize-duration";
import { Formatting, Numeral } from "@talxis/client-libraries";

export const Duration = (props: IDuration) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const componentRef = useRef<IComboBox>(null);
    const context = props.context;
    const formattingInfo = context.userSettings;
    const numberFormatting = context.userSettings.numberFormattingInfo;
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const hoursPerDay = typeof parameters.HoursPerDay?.raw === 'number' && parameters.HoursPerDay.raw > 0 ? parameters.HoursPerDay.raw : 24;

    const formatter = (value: number | null) => {
        if (typeof value === 'number') {
            return Formatting.Get().formatDuration(value, hoursPerDay);
        }
        return value;
    };

    const valueExtractor = (str: string | null): number | undefined | string => {
        //extraction of number of minutes from formatted string should happen here
        // parsing because labels are string that represent array of strings
        if(initialFormattedValue === str) {
            return boundValue.raw as number;
        }
        const minuteLabels = JSON.parse(labels.minute());
        const minutesLabels = JSON.parse(labels.minutes());
        const hourLabels = JSON.parse(labels.hour());
        const hoursLabels = JSON.parse(labels.hours());
        const dayLabels = JSON.parse(labels.day());
        const daysLabels = JSON.parse(labels.days());
        const minuteRegex = new RegExp("^(" + minuteLabels.join('|') + ")\\s|\\s(" + minuteLabels.join('|') + ")$|^(" + minutesLabels.join('|') + ")\\s|\\s(" + minutesLabels.join('|') + ")$", "i");
        const hourRegex = new RegExp("^(" + hourLabels.join('|') + ")\\s|\\s(" + hourLabels.join('|') + ")$|^(" + hoursLabels.join('|') + ")\\s|\\s(" + hoursLabels.join('|') + ")$", "i");
        const dayRegex = new RegExp("^(" + dayLabels.join('|') + ")\\s|\\s(" + dayLabels.join('|') + ")$|^(" + daysLabels.join('|') + ")\\s|\\s(" + daysLabels.join('|') + ")$", "i");

        if (str && str.trim()) {
            let input = str.trim().toLowerCase();
            let unit = 'minute';

            if (minuteRegex.test(input)) {
                input = input.replace(minuteRegex, "").trim();
            } else if (hourRegex.test(input)) {
                input = input.replace(hourRegex, "").trim();
                unit = 'hour';
            } else if (dayRegex.test(input)) {
                input = input.replace(dayRegex, "").trim();
                unit = 'day';
            }
            const parsedNumber = parseNumber(input);
            if (parsedNumber && !isNaN(parsedNumber)) {
                return getDurationInMinutes(parsedNumber, unit);
            }
            return str;
        }
        return undefined;
    };

    const parseNumber = (input: string): number | undefined => {
        Numeral.decimal(numberFormatting);
        return numeral(input).value() ?? undefined;
    };

    const getDurationInMinutes = (value: number, unit: string): number => {
        switch (unit) {
            case 'hour':
                return 60 * value;
            case 'day':
                return minutesPerDay * value;
            case 'minute':
            default:
                return value;
        }
    };

    const presetOptions = (): IComboBoxOption[] => {
        const formattedOptions = durationOptions.map(option => ({
            key: option.Value.toString(),
            text: formatter(parseInt(option.Label)) ?? "",
        }));
        return formattedOptions;
    };

    const comboBoxOptions: IComboBoxOption[] = presetOptions();

    const { value, labels, sizing, setValue, onNotifyOutputChanged, theme } = useInputBasedControl<string | null, IDurationParameters, IDurationOutputs, Required<IDuration>['translations']>('Duration', props, {
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
        calloutProps: {
            theme: props.context.fluentDesignLanguage?.applicationTheme ?? theme
        },
        onRenderContainer: (containerProps, defaultRender) => <ThemeProvider theme={props.context.fluentDesignLanguage?.applicationTheme}>{defaultRender?.(containerProps)}</ThemeProvider>,
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
        }
    });

    return (
        <ThemeProvider theme={theme} applyTo="none">
            <ComboBox {...componentProps} />
        </ThemeProvider>
    );
};