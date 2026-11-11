import { useMemo } from "react";
import { ICommandBarItemProps, MessageBarType } from "@fluentui/react";
import { ThemeContext, useThemeBuilder, useTheme } from "@theme";
import { useLabels } from "@labels";
import { ErrorMessageBarComponents, IErrorMessageBarComponents } from "./components";
import { ERROR_MESSAGE_BAR_LABELS } from "./labels";
import { getErrorMessageBarStyles } from "./styles";

export interface IErrorMessageBarProps {
    /** The error, cut to one line on the bar and shown whole in a tooltip. */
    title: string;
    /** Shown by the *Details* command. */
    details?: string;
    /** Adds a *Details* command when there are details, such as `useOpenErrorDialog()`. */
    onOpenDetails?: (error: { title: string; details: string }) => void;
    /** Adds a *Try again* command that calls this. */
    onRetry?: () => void;
    /** Replacements for the bar, its title, its tooltip and its commands. */
    components?: Partial<IErrorMessageBarComponents>;
}

/** An error on one line with optional details and retry commands. */
export const ErrorMessageBar = (props: IErrorMessageBarProps) => {
    const components = { ...ErrorMessageBarComponents, ...props.components };
    const labels = useLabels(ERROR_MESSAGE_BAR_LABELS);
    const theme = useTheme();
    const styles = useMemo(() => getErrorMessageBarStyles(), []);
    const commandBarTheme = useThemeBuilder({ colors: { primary: theme.palette.themePrimary, background: theme.semanticColors.errorBackground, text: theme.semanticColors.messageText } });

    const getItems = (): ICommandBarItemProps[] => {
        const items: ICommandBarItemProps[] = [];
        const { details, onOpenDetails } = props;
        if (details && onOpenDetails) {
            items.push({ key: 'details', text: labels.get('errorMessageBar.details'), iconProps: { iconName: 'Info' }, onClick: () => onOpenDetails({ title: props.title, details }) });
        }
        if (props.onRetry) {
            items.push({ key: 'tryAgain', text: labels.get('errorMessageBar.tryAgain'), iconProps: { iconName: 'Refresh' }, onClick: props.onRetry });
        }
        return items;
    };

    return components.onRender({
        messageBarType: MessageBarType.error,
        isMultiline: false,
        styles: { content: styles.content, actions: styles.actions },
        actions: <ThemeContext theme={commandBarTheme}>{components.onRenderCommandBar({ items: getItems(), styles: { root: styles.commandBar } })}</ThemeContext>,
        children: components.onRenderTooltip({ content: props.title, children: components.onRenderTitle({ className: styles.title, children: props.title }) }),
    });
};
