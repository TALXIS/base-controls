import { ReactElement } from "react";
import { Text } from '@fluentui/react';
import { optionSetStyles } from "./styles";
import color from 'color';
import { useTheme } from "@fluentui/react";
import { DataType } from "../../../../enums/DataType";
import { IMultiSelectOptionSet } from "../../../../../../MultiSelectOptionSet";
import { IOptionSet } from "../../../../../../OptionSet";
import { ITwoOptions } from "../../../../../../TwoOptions";

interface IReadOnlyOptionSet {
    controlProps: IMultiSelectOptionSet | IOptionSet | ITwoOptions
    defaultRender: () => ReactElement
}

export const ReadOnlyOptionSet = (props: IReadOnlyOptionSet) => {
    const { defaultRender } = { ...props }
    const valueParameter = props.controlProps.parameters.value;
    const allOptions = props.controlProps.parameters.value.attributes.Options;
    const dataType = valueParameter.type as DataType;
    const theme = useTheme();
    const defaultColor = theme.palette.neutralLight;

    const options = (() => {
        let value: any = valueParameter.raw;
        if (dataType === DataType.OPTIONSET) {
            value = value ? [parseInt(value)] : null;
        }
        if (dataType === DataType.MULTI_SELECT_OPTIONSET) {
            value = value ? value.split(',').map((value: string) => parseInt(value)) : null;
        }
        if (dataType === DataType.TWO_OPTIONS) {
            value = [parseInt(value)];
        }
        return allOptions.filter(option => value?.includes(option.Value)) ?? [];
    })();

    if (options.length === 0 || !options.find(x => x.Color)) {
        return defaultRender();
    }
    else {
        return (
            <div className={optionSetStyles.root}>
                {options.map(x => <div
                    key={x.Value}
                    title={x.Label}
                    className={optionSetStyles.option}
                    style={{ backgroundColor: x.Color ?? defaultColor, color: new color(x.Color ?? defaultColor).isDark() ? 'white' : 'black' }}>
                    <Text>{x.Label}</Text>
                </div>)}
            </div>
        )
    }

}