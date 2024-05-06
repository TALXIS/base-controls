import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import React, { useEffect } from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { IDuration, IDurationOutputs, IDurationParameters, IDurationTranslations } from './interfaces';
import { IComboBoxOption } from '@fluentui/react';
import { durationOptions } from '../../sandbox/shared/durationList';
import { UserSettings } from '../../sandbox/mock/UserSettings';
import numeral from "numeral";
import { NumeralPCF } from '../../utils/NumeralPCF';
export const Duration = (props: IDuration) => {
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const context = props.context;
    const humanizeDuration = require("humanize-duration");
    const formattingInfo = context.userSettings as  UserSettings;
    const language = formattingInfo.locale;
    const numberFormatting = context.userSettings.numberFormattingInfo;
    const comboBoxOptions: IComboBoxOption[] = durationOptions.map(option => ({
        key: option.Value.toString(),
        text: option.Label,
    }));

    useEffect(() => { NumeralPCF.register(numberFormatting); }, []);

    const formatter = (value: number | null) => {
        //all duration formatting should happen here
        if (value === null) return null;
        const durationInMilliseconds = value * 60000;
        const units = value <= 60 ? ['m'] : value >= 1440 ? ['d'] : ['h'];
        const options = {
            units: units,
            maxDecimalPoints: 2,
            language: language.slice(0, language.indexOf("-")),
            fallbacks:["en"]
        };
        return humanizeDuration(durationInMilliseconds, options);
    };

    const valueExtractor = (str: string | null) : number | undefined => {
        //extraction of number of minutes from formatted string should happen here
        numeral.locale('__pcfcustom');
        return numeral(str).value() ?? undefined;
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
                }}
                onInputValueChange={(text)=>{
                    setValue(text ?? '');
                }}
                onBlur={(event) => {
                    onNotifyOutputChanged({
                        value: valueExtractor(value) 
                    });
                }}
                onChange={(e, value) => {
                    setValue(value?.text ?? '');
                }}
            />
        </>
    );
};