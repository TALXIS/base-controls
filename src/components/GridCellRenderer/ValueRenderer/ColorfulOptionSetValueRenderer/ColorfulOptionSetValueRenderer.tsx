import { useMemo } from "react";
import { IColorfulOptionSetValueRendererProps as IColorfulOptionSetValueRendererPropsBase, IColorfulOptionValueRendererProps as IColorfulOptionValueRendererPropsBase } from "@components/GridCellRenderer/interfaces"
import { getColorfulOptionSetValuesRendererStyles, getColorfulOptionValueRendererStyles } from "./styles";
import { PartialTheme, Text, ThemeProvider, merge } from "@fluentui/react";
import { Theming, useThemeGenerator } from "@legacy";
import { useModel } from "@components/GridCellRenderer/useModel";

interface IColorfulOptionSetValueRendererProps {
    optionSet: ComponentFramework.PropertyHelper.OptionMetadata[];
    onRenderColorfulOptionSet: (props: IColorfulOptionSetValueRendererPropsBase, defaultRender: (props: IColorfulOptionSetValueRendererPropsBase) => React.ReactElement) => React.ReactElement;
}

interface IColorfulOptionValueRendererProps {
    option: ComponentFramework.PropertyHelper.OptionMetadata;
    onRenderOption: (props: IColorfulOptionValueRendererPropsBase, defaultRender: (props: IColorfulOptionValueRendererPropsBase) => React.ReactElement) => React.ReactElement;
}

export const ColorfulOptionSetValueRenderer = (props: IColorfulOptionSetValueRendererProps) => {
    const { onRenderColorfulOptionSet, optionSet } = props;
    const model = useModel();
    const styles = useMemo(() => getColorfulOptionSetValuesRendererStyles(model.getColumnAlignment()), [model.getColumnAlignment()]);

    return onRenderColorfulOptionSet({
        container: {
            className: styles.colorfulOptionSetValueRendererRoot
        },
        onRenderOption: (props, defaultRender) => defaultRender(props)
    }, (props) => {
        return <div {...props.container}>
            {optionSet.map(option => {
                return <ColorOptionValueRenderer
                    key={option.Value}
                    option={option}
                    onRenderOption={props.onRenderOption} />
            })}
        </div>
    })
}

const ColorOptionValueRenderer = (props: IColorfulOptionValueRendererProps) => {
    const { option, onRenderOption } = props;
    const model = useModel();
    //the cell's theme, off the model: nothing above this provides one
    const backgroundColor = option.Color ?? model.getControlTheme().palette.neutralLight;
    const textColor = Theming.GetTextColorForBackground(backgroundColor);
    const styles = useMemo(() => getColorfulOptionValueRendererStyles(), []);
    const optionTheme = useThemeGenerator(textColor, backgroundColor, textColor, merge({}, {
        fonts: {
            medium: {
                fontWeight: 600
            }
        }
    } as PartialTheme, model.getContext().fluentDesignLanguage?.v8FluentOverrides as PartialTheme));

    return onRenderOption({
        container: {
            theme: optionTheme,
            className: styles.colorfulOptionValueRendererRoot
        },
        onRenderText: (props, defaultRender) => defaultRender(props)
    }, (props) => {
        return <ThemeProvider {...props.container}>
            {props.onRenderText({
                children: option.Label,
            }, (props) => {
                return <Text {...props} />
            })}
        </ThemeProvider>
    })
}