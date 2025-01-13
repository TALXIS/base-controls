import { DataType } from "@talxis/client-libraries";
import { IOptionSet } from "../../OptionSet"
import { DefaultContentRenderer } from "../GridCellRenderer";
import { IMultiSelectOptionSet } from "../../MultiSelectOptionSet";
import { ITwoOptions } from "../../TwoOptions";
import { ThemeProvider } from "@fluentui/react";
import { Theming, useThemeGenerator } from "@talxis/react-components";
import { Text } from '@fluentui/react';
import { IContext } from "../../../interfaces";
import { useMemo } from "react";
import { getColorfulOptionStyles, getOptionSetStyles } from "./styles";

export const OptionSet = (props: IOptionSet | IMultiSelectOptionSet | ITwoOptions) => {
    const dataType: DataType = props.parameters.value.type as DataType;
    const options = props.parameters.value.attributes.Options;
    const formattedValue = props.parameters.value.formatted ?? '';
    const value: any = props.parameters.value.raw;
    const styles = useMemo(() => getOptionSetStyles(), []);

    const shouldRenderDefaultLabel = () => {
        if (!props.parameters.EnableOptionSetColors?.raw || !options.some(option => option.Color)) {
            return true;
        }
        return false;
    }

    const getSelectedOptions = () => {
        let result: any = value ?? [];
        switch (dataType) {
            case 'OptionSet': {
                result = [value]
                break;
            }
            case 'TwoOptions': {
                result = [+value];
                break;
            }
        }
        return options.filter(option => result?.includes(option.Value)) ?? [];
    }

    if (shouldRenderDefaultLabel()) {
        return <DefaultContentRenderer>{formattedValue}</DefaultContentRenderer>
    }
    return (<div className={styles.root}>
        {getSelectedOptions().map(option => {
            return <ColorfulOption key={option.Value} option={option} context={props.context} />
        })}
    </div>)
}

const ColorfulOption = (props: { option: ComponentFramework.PropertyHelper.OptionMetadata, context: IContext }) => {
    const option = props.option;
    const textColor = Theming.GetTextColorForBackground(option.Color);
    const styles = useMemo(() => getColorfulOptionStyles(), []);
    const theme = useThemeGenerator(textColor, option.Color, textColor, props.context.fluentDesignLanguage?.v8FluentOverrides);

    return (
        <ThemeProvider className={styles.option} theme={theme}>
            <Text>{option.Label}</Text>
        </ThemeProvider>
    )
}