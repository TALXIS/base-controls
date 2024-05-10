import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import React, { useEffect } from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { IDuration, IDurationOutputs, IDurationParameters, IDurationTranslations } from './interfaces';
import { IComboBoxOption } from '@fluentui/react';
import { durationOptions } from '../../sandbox/shared/durationList';
import { UserSettings } from '../../sandbox/mock/UserSettings';
import numeral from "numeral";
import { NumeralPCF } from '../../utils/NumeralPCF';
import { getDefaultDurationTranslations } from './translations';
export const Duration = (props: IDuration) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const context = props.context;
    const humanizeDuration = require("humanize-duration");
    const formattingInfo = context.userSettings as UserSettings;
    const language = formattingInfo.locale;
    const numberFormatting = context.userSettings.numberFormattingInfo;

    const formatter = (value: number | null) => {
        //all duration formatting should happen here
        if (value === null) return null;
        const durationInMilliseconds = value * 60000;
        const units = value < 60 ? ['m'] : value >= 1440 ? ['d'] : ['h'];
        const options = {
            units: units,
            maxDecimalPoints: 2,
            language: language.slice(0, language.indexOf("-")),
            fallbacks: ["en"]
        };
        return humanizeDuration(durationInMilliseconds, options);
    };

    const valueExtractor = (str: string | null): number | undefined => {
        //extraction of number of minutes from formatted string should happen here
       // parsing because labels are string that represent array of strings
        const minuteLabels= JSON.parse(labels.minute);
        const minutesLabels= JSON.parse(labels.minutes);
        const hourLabels= JSON.parse(labels.hour);
        const hoursLabels= JSON.parse(labels.hours);
        const dayLabels= JSON.parse(labels.day);
        const daysLabels= JSON.parse(labels.days);
        const minuteRegex = new RegExp("^(" + minuteLabels.join('|') + ")\\s|\\s(" + minuteLabels.join('|') + ")$|^(" + minutesLabels.join('|') + ")\\s|\\s(" + minutesLabels.join('|') + ")$", "i");
        const hourRegex = new RegExp("^(" + hourLabels.join('|') + ")\\s|\\s(" + hourLabels.join('|') + ")$|^(" + hoursLabels.join('|') + ")\\s|\\s(" + hoursLabels.join('|') + ")$", "i");
        const dayRegex = new RegExp("^(" + dayLabels.join('|') + ")\\s|\\s(" + dayLabels.join('|') + ")$|^(" + daysLabels.join('|') + ")\\s|\\s(" + daysLabels.join('|') + ")$", "i");

        if (str && str.trim()) {
            let input = str.trim();
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
            return NaN;
        }
        return undefined;
    };

    const parseNumber = (input: string): number | undefined => {
        return numeral(input).value() ?? undefined;
    };

    const getDurationInMinutes = (value: number, unit: string): number => {
        switch (unit) {
            case 'hour':
                return 60 * value;
            case 'day':
                return 60 * value * 24;
            case 'minute':
            default:
                return value;
        }
    };

    const presetOptions = (): IComboBoxOption[] => {
        const formattedOptions = durationOptions.map(option => ({
            key: option.Value.toString(),
            text: formatter(parseInt(option.Label)),
        }));
        return formattedOptions;
    };

    const comboBoxOptions: IComboBoxOption[] = presetOptions();
    useEffect(() => {
        NumeralPCF.register(numberFormatting);
    }, []);

    const [value, labels, setValue, onNotifyOutputChanged] = useInputBasedComponent<string | null, IDurationParameters, IDurationOutputs, IDurationTranslations>('Duration', props, {
        formatter: formatter,
        valueExtractor: valueExtractor,
        defaultTranslations: getDefaultDurationTranslations(),
    });

    return (
        <>
            <span>{value}</span>
            <ComboBox
                borderless={parameters.EnableBorder?.raw === false}
                options={comboBoxOptions}
                allowFreeInput={true}
                autoComplete='on'
                autofill={parameters.AutoFocus?.raw === true ? {
                    autoFocus: true
                } : undefined}
                readOnly={context.mode.isControlDisabled}
                dropdownWidth={context.mode.allocatedWidth || undefined}
                text={value ?? ''}
                styles={{
                    root: {
                        height: context.mode.allocatedHeight || undefined,
                        width: context.mode.allocatedWidth || undefined,
                        display: 'flex',
                        alignItems: 'center',
                    },
                    callout: {
                        height: 100
                    }
                }}
                onInputValueChange={(text) => {
                    setValue(text ?? '');
                }}
                onBlur={(event) => {
                    onNotifyOutputChanged({
                        value: valueExtractor(value)
                    });
                }}
                onChange={(e, value) => {
                    onNotifyOutputChanged({
                        value: valueExtractor(value?.text ?? '')
                    });
                }}
            />
        </>
    );
};