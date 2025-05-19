import { useMemo } from "react";
import { getColorfulOptionsStyles } from "./styles";
import { IContext, IMultiSelectOptionSetProperty } from "../../../interfaces";
import { ThemeProvider, Text, useTheme, merge, PartialTheme } from "@fluentui/react";
import { Theming, useThemeGenerator } from "@talxis/react-components";

interface IColorfulOptionsProps {
    value: IMultiSelectOptionSetProperty;
    context: IContext;
}

export const ColorfulOptions = (props: IColorfulOptionsProps) => {
    const styles = useMemo(() => getColorfulOptionsStyles(), []);
    const { value } = props;
    const theme = useTheme();
    const options = value.attributes.Options;

    const getOptionProperties = (option: ComponentFramework.PropertyHelper.OptionMetadata | undefined): { containerProps: { className: string; theme: PartialTheme }; option: ComponentFramework.PropertyHelper.OptionMetadata | undefined; textProps: { children: string | undefined }; } => {
        const backgroundColor = (option && option.Color) ?? theme.palette.neutralLight;
        console.log('becc ', backgroundColor);
        const textColor = Theming.GetTextColorForBackground(backgroundColor);
        console.log('textt ', textColor);
        const optionTheme = useThemeGenerator(textColor, backgroundColor, textColor, merge({}, {
            fonts: {
                medium: {
                    fontWeight: 600
                }
            }
        } as PartialTheme, props.context.fluentDesignLanguage?.v8FluentOverrides as PartialTheme));
        return {
            containerProps: {
                className: styles.option,
                theme: optionTheme,
            },
            option: option,
            textProps: {
                children: option?.Label,
            },
        };
    };


    return (
        <div className={styles.root}>
            {value.raw?.map((value, index) => {
                const option = options.find(option => option.Value == value);
                const optionProps = getOptionProperties(option);
                return (
                    <ThemeProvider key={index} {...optionProps.containerProps}>
                        <Text {...optionProps.textProps}>{optionProps.textProps.children}</Text>
                    </ThemeProvider>
                );
            })}
        </div>
    );
}
