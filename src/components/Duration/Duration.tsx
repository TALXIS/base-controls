import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import React from 'react';
import { useInputBasedComponent } from '../../hooks/useInputBasedComponent';
import { IDuration, IDurationOutputs, IDurationParameters, IDurationTranslations } from './interfaces';
export const Duration = (props: IDuration) => {

    const formatter = (value: number | null) => {
        //all duration formatting should happen here
        return `formatted ${value ? value : ''}`
    }
    const valueExtractor = () => {
        //extraction of number of minutes from formatted string should happen here
    }
    const [value, labels, setValue, onNotifyOutputChanged] = useInputBasedComponent<string | null, IDurationParameters, IDurationOutputs, IDurationTranslations>('Duration', props, {
        formatter: formatter,
        valueExtractor: valueExtractor
    });

    return (
        <>
            <span>{value}</span>
            <ComboBox options={[]} />
        </>
    )
}