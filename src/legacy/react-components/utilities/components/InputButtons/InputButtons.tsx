import { ThemeProvider, useTheme } from "@fluentui/react";
import { getSuffixStyles } from "./styles";
import { useInputButtons } from "./useInputButtons";
import { useMemo } from "react";
import { CommandBar, ICommandBarItemProps } from "@legacy/components/CommandBar/CommandBar";
import { useClassNames } from "@legacy/hooks/useClassNames";
import { ICopyButton } from "@legacy/interfaces/components";
import { useThemeGenerator } from "@legacy/utilities/theming/hooks/useThemeGenerator";
import { Theming } from "@legacy/utilities/theming";

export interface IInputButtons {
    /**
     * Value of the input the buttons are rendered in
     */
    value?: string | undefined;
    buttons?: ICommandBarItemProps[];
    clickToCopyProps?: ICopyButton["clickToCopyProps"]
    deleteButtonProps?: ICommandBarItemProps;
    disabled?: boolean;
    readOnly?: boolean;
    backgroundColor?: string
}

export const InputButtons = (props: IInputButtons) => {
    const parentTheme = useTheme();
    const backgroundColor = props.backgroundColor ?? parentTheme.semanticColors.inputBackground;
    const textColor = useMemo(() => Theming.GetTextColorForBackground(backgroundColor), [backgroundColor]);

    const theme = useThemeGenerator(
        textColor,
        backgroundColor,
        textColor
    )
    //replace due to back comp with old CSS where it often targets the class name directly
    //the decision to add the properties as --propName directly to className instead of creating
    //another class was really unfortunate, we need to abandon this practice
    const classNames = useClassNames('Input-Buttons', {}).replace('--underlined', '');
    const suffixStyles = useMemo(() => getSuffixStyles(theme), [theme]);

    const { items } = useInputButtons(props, theme);

    if (!props.buttons && !props.clickToCopyProps && !props.deleteButtonProps) {
        return <></>
    }
    return <ThemeProvider
        className={`${classNames} ${suffixStyles.root}`}
        theme={theme} applyTo="none">
        <CommandBar
            contextualMenuTheme={parentTheme}
            items={[]}
            theme={theme}
            farItems={items} />
    </ThemeProvider>
}