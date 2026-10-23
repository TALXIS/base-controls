import { useMemo } from "react";
import { ICommandBarItemProps, MessageBarType, useTheme } from "@fluentui/react";
import { ThemeContext, useThemeGenerator } from "@theme";
import { LocalizationService } from "@utils/localization";
import { usePcfContext } from "@utils/adapters/pcf-context/context";
import { ErrorMessageBarComponents, IErrorMessageBarComponents } from "./components";
import { ERROR_MESSAGE_BAR_LABELS, IErrorMessageBarLabels } from "./labels";
import { getErrorMessageBarStyles } from "./styles";

export interface IErrorMessageBarProps {
    /** The error, cut to one line on the bar and shown whole in a tooltip. */
    title: string;
    /** Adds a *Details* command that shows these under the title in the PCF error dialog. */
    details?: string;
    /** Adds a *Try again* command that calls this. */
    onRetry?: () => void;
    /** The commands' texts, in English where left out. */
    labels?: Partial<IErrorMessageBarLabels>;
    /** Replacements for the bar, its title, its tooltip and its commands. */
    components?: Partial<IErrorMessageBarComponents>;
}

/** An error on one line with optional details and retry commands, rendered inside `PcfContextProvider`. */
export const ErrorMessageBar = (props: IErrorMessageBarProps) => {
    const pcfContext = usePcfContext();
    const components = { ...ErrorMessageBarComponents, ...props.components };
    const labels = useMemo(() => new LocalizationService({ ...ERROR_MESSAGE_BAR_LABELS, ...props.labels }), []);
    const theme = useTheme();
    const styles = useMemo(() => getErrorMessageBarStyles(), []);
    const commandBarTheme = useThemeGenerator({ primary: theme.palette.themePrimary, background: theme.semanticColors.errorBackground, text: theme.semanticColors.messageText });

    const getItems = (): ICommandBarItemProps[] => {
        const items: ICommandBarItemProps[] = [];
        if (props.details) {
            items.push({ key: 'details', text: labels.getLocalizedString('details'), iconProps: { iconName: 'Info' }, onClick: () => { pcfContext.navigation.openErrorDialog({ message: props.title, details: props.details }); } });
        }
        if (props.onRetry) {
            items.push({ key: 'tryAgain', text: labels.getLocalizedString('tryAgain'), iconProps: { iconName: 'Refresh' }, onClick: props.onRetry });
        }
        return items;
    };

    return components.onRenderMessageBar({
        messageBarType: MessageBarType.error,
        isMultiline: false,
        styles: { content: styles.content, actions: styles.actions },
        actions: <ThemeContext theme={commandBarTheme}>{components.onRenderCommandBar({ items: getItems(), styles: { root: styles.commandBar } })}</ThemeContext>,
        children: components.onRenderTooltip({ content: props.title, children: components.onRenderTitle({ className: styles.title, children: props.title }) }),
    });
};
