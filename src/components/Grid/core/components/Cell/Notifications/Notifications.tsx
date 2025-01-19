import { Icon, useTheme, Text, Callout, PrimaryButton, DefaultButton, Link, ICommandBar, ThemeProvider, getTheme } from "@fluentui/react"
import { getNotificationIconStyles } from "./styles";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { IAddControlNotificationOptions, IControlNotificationAction } from "@talxis/client-libraries";
import { CommandBar, useThemeGenerator } from "@talxis/react-components";
import { useGridInstance } from "../../../hooks/useGridInstance";
import { useDebouncedCallback } from "use-debounce";

interface INotifications {
    notifications: IAddControlNotificationOptions[],
    onShouldNotificationsFillAvailableSpace?: (value: boolean) => void;
    className?: string;
}

export interface INotificationsRef {
    remeasureCommandBar: () => void;
}

export const Notifications = forwardRef<INotificationsRef, INotifications>((props, ref) => {
    const { notifications } = { ...props };
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getNotificationIconStyles(theme);
    const iconId = useMemo(() => `icon${crypto.randomUUID()}`, []);
    const [selectedNotification, setSelectedNotification] = useState<IAddControlNotificationOptions | null>(null);
    const commandBarRef = useRef<ICommandBar>(null);
    const overridenTheme = useThemeGenerator(theme.semanticColors.bodyText, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText);

    const getIconName = (notification: IAddControlNotificationOptions): string | undefined => {
        if (notification.iconName) {
            return notification.iconName;
        }
        return notification.notificationLevel === 'ERROR' ? 'Error' : undefined;
    }

    const renderActionButton = (action: IControlNotificationAction, buttonType: 'primary' | 'default') => {
        const Button = buttonType === 'primary' ? PrimaryButton : DefaultButton;
        return <Button
            text={action.message}
            iconProps={action?.iconName ? {
                iconName: action.iconName
            } : undefined}
            onClick={() => action.actions.map(callback => callback())} />
    }

    const renderActions = (actions: IControlNotificationAction[]): JSX.Element => {
        if (actions.length === 0) {
            return <></>
        }
        //render actions as buttons
        if (actions.length < 3) {
            return <div className={styles.buttons}>
                {actions.map((action, i) => renderActionButton(action, i === 0 ? 'primary' : 'default'))}
            </div>
        }
        return <CommandBar items={actions.map((action, i) => {
            return {
                key: i.toString(),
                text: action.message,
                commandBarButtonAs: () => <Link onClick={() => action.actions.map(callback => callback())} className={styles.link}>
                    {action.iconName &&
                        <Icon iconName={action.iconName} />
                    }
                    {action.message}
                </Link>,
                iconProps: {
                    iconName: action.iconName
                },
                onClick: () => {
                    action.actions.map(callback => callback())
                }
            }
        })} />
    }

    const onNotificationClick = (notification: IAddControlNotificationOptions) => {
        if (notification.actions?.length === 1) {
            notification.actions[0].actions.map(callback => callback());
            return;
        }
        setSelectedNotification(notification);
    };

    const getCommandBarItem = (notification: IAddControlNotificationOptions) => {
        const icon = getIconName(notification);
        return {
            key: notification.uniqueId,
            text: notification.title,
            title: notification.title,
            onClick: () => onNotificationClick(notification),
            buttonStyles: {
                textContainer: {
                    display: notification.compact ? 'none' : undefined
                }
            },
            iconProps: notification ? {
                iconName: icon,
                styles: {
                    root: {
                        color: notification.notificationLevel === 'ERROR' ? `${theme.semanticColors.errorIcon} !important` : undefined
                    }
                }
            } : undefined
        }
    };

    const getContextualMenuColors = () => {
        const tokenTheme = grid.pcfContext.fluentDesignLanguage?.tokenTheme;
        if (!tokenTheme) {
            return {
                primaryColor: getTheme().palette.themePrimary,
                backgroundColor: getTheme().semanticColors.bodyBackground,
                textColor: getTheme().semanticColors.bodyText
            }
        }
        return {
            primaryColor: tokenTheme.colorBrandForeground1,
            backgroundColor: tokenTheme.colorNeutralBackground1,
            bodyText: tokenTheme.colorNeutralForeground1
        }
    }

    const debouncedShouldGrowCallback = useDebouncedCallback((shouldGrow: boolean) => {
        props.onShouldNotificationsFillAvailableSpace?.(shouldGrow);
    }, 0);

    useImperativeHandle(ref, () => {
        return {
            remeasureCommandBar: () => {
                commandBarRef.current?.remeasure();
            }
        }
    })
    const contextualMenuColors = getContextualMenuColors();
    const contextualMenuTheme = useThemeGenerator(contextualMenuColors.primaryColor, contextualMenuColors.backgroundColor, contextualMenuColors.bodyText);

    return <div className={`${styles.root}${props.className ? ` ${props.className}` : ''}`}>
        <ThemeProvider theme={overridenTheme} applyTo="none">
            <CommandBar
                onDataGrown={() => debouncedShouldGrowCallback(false)}
                onDataReduced={() => debouncedShouldGrowCallback(true)}
                overflowItems={notifications.filter(x => x.renderedInOverflow).map(y => getCommandBarItem(y))}
                contextualMenuTheme={contextualMenuTheme}
                id={iconId}
                componentRef={commandBarRef}
                items={notifications.filter(x => !x.renderedInOverflow).map(y => getCommandBarItem(y))} />
        </ThemeProvider>
        {selectedNotification &&
            <Callout
                theme={contextualMenuTheme}
                hidden={!selectedNotification}
                className={styles.callout}
                onDismiss={() => setSelectedNotification(null)}
                target={`#${iconId}`}>
                <ThemeProvider className={styles.calloutContent} theme={contextualMenuTheme}>
                    {selectedNotification.title &&
                        <Text title={selectedNotification.title} className={styles.calloutTitle} variant={selectedNotification.messages.length > 0 ? 'xLarge' : undefined}>{selectedNotification.title}</Text>
                    }
                    <Text>{selectedNotification.messages[0]}</Text>
                    {selectedNotification.actions &&
                        renderActions(selectedNotification.actions)
                    }
                </ThemeProvider>
            </Callout>
        }
    </div>
});