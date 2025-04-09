import { DataType } from "@talxis/client-libraries";
import { IOptionSet } from "../../OptionSet"
import { IMultiSelectOptionSet } from "../../MultiSelectOptionSet";
import { ITwoOptions } from "../../TwoOptions";
import { PartialTheme, ThemeProvider, useTheme, merge } from "@fluentui/react";
import { Theming, useThemeGenerator } from "@talxis/react-components";
import { Text } from '@fluentui/react';
import { IContext } from "../../../interfaces";
import { useMemo } from "react";
import { getColorfulOptionStyles, getOptionSetStyles } from "./styles";
import { useComponentProps } from "../useComponentProps";
import { IOptionSetProps } from "../interfaces";
import { DefaultContentRenderer } from "../DefaultContentRenderer";

export const OptionSet = (props: IOptionSet | IMultiSelectOptionSet | ITwoOptions) => {
    const dataType: DataType = props.parameters.value.type as DataType;
    const options = props.parameters.value.attributes.Options;
    const value: any = props.parameters.value.raw;
    const styles = useMemo(() => getOptionSetStyles(), []);
    const componentProps = useComponentProps();

    const optionSetProps = componentProps.onGetOptionSetProps({
        containerProps: {
            className: styles.root
        },
        onGetOptionProps: (props) => props
    })

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
        return <DefaultContentRenderer />
    }
    return (<div {...optionSetProps.containerProps}>
        {getSelectedOptions().map(option => {
            return <ColorfulOption
                key={option.Value}
                optionSetProps={optionSetProps}
                option={option}
                context={props.context} />
        })}
    </div>)
}

const ColorfulOption = (props: {
    option: ComponentFramework.PropertyHelper.OptionMetadata,
    context: IContext;
    optionSetProps: IOptionSetProps
}) => {
    const theme = useTheme();
    const option = props.option;
    const backgroundColor = option.Color ?? theme.palette.neutralLight;
    const textColor = Theming.GetTextColorForBackground(backgroundColor);
    const styles = useMemo(() => getColorfulOptionStyles(), []);
    const optionTheme = useThemeGenerator(textColor, backgroundColor, textColor, merge({}, {
        fonts: {
            medium: {
                fontWeight: 600
            }
        }
    } as PartialTheme, props.context.fluentDesignLanguage?.v8FluentOverrides as PartialTheme));

    const optionProps = props.optionSetProps.onGetOptionProps({
        containerProps: {
            className: styles.option,
            theme: optionTheme
        },
        option: option,
        textProps: {
            children: option.Label
        }
    })

    return (
        <ThemeProvider {...optionProps.containerProps}>
            <Text {...optionProps.textProps}>{optionProps.textProps.children}</Text>
        </ThemeProvider>
    )
}