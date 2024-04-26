import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import React from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { IDuration, IDurationOutputs, IDurationParameters, IDurationTranslations } from './interfaces';
import { IComboBoxOption } from '@fluentui/react';
import { durationOptions } from '../../sandbox/shared/durationList';
export const Duration = (props: IDuration) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const context = props.context;
    const humanizeDuration = require("humanize-duration");
    const formattingInfo = context.userSettings;
    const comboBoxOptions: IComboBoxOption[] = durationOptions.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    const formatter = (value: number | null) => {
        //all duration formatting should happen here
        if (value === null) return null;
        const durationInMilliseconds = value * 60000;
        const units = value <= 60 ? ['m'] : value >= 1440 ? ['d'] : ['h'];
        const options = {
            delimiter: formattingInfo?.numberFormattingInfo.numberGroupSeparator || ',',
            units: units,
            maxDecimalPoints: 2
        };
        return humanizeDuration(durationInMilliseconds, options);
    };

    const valueExtractor = () => {
        //extraction of number of minutes from formatted string should happen here
    };

    const [value, labels, setValue, onNotifyOutputChanged] = useInputBasedComponent<string | null, IDurationParameters, IDurationOutputs, IDurationTranslations>('Duration', props, {
        formatter: formatter,
        valueExtractor: valueExtractor
    });

    return (
        <>
            <span>{value}</span>
            <ComboBox
                borderless={parameters.EnableBorder?.raw === false}
                options={comboBoxOptions}
                allowFreeInput={true}
                autofill={parameters.AutoFocus?.raw === true ? {
                    autoFocus: true
                } : undefined}
                readOnly={context.mode.isControlDisabled}
                dropdownWidth={context.mode.allocatedWidth || undefined}
                styles={{
                    root: {
                        height: context.mode.allocatedHeight || undefined,
                        width: context.mode.allocatedWidth || undefined,
                        display: 'flex',
                        alignItems: 'center',
                    },
                }}
                onChange={(e, value) => {
                }}
            />
        </>
    );
};