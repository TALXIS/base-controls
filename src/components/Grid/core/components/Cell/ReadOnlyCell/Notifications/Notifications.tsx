import { Icon, useTheme, Text, Callout, PrimaryButton, DefaultButton, Link, ICommandBar, ThemeProvider } from "@fluentui/react"
import { getNotificationIconStyles } from "./styles";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { IAddControlNotificationOptions, IControlNotificationAction } from "@talxis/client-libraries";
import { CommandBar } from "@talxis/react-components";
import { useThemeOverride } from "../../../../../../../hooks/useThemeOverride";

interface INotifications {
    notifications: IAddControlNotificationOptions[],
    className?: string;
}

export interface INotificationsRef {
    remeasureCommandBar: () => void;
}


export const Notifications = forwardRef<INotificationsRef, INotifications>((props, ref) => {
    const { notifications } = { ...props };
    const theme = useTheme();
    const styles = getNotificationIconStyles(theme);
    const iconId = useMemo(() => `icon${crypto.randomUUID()}`, []);
    const [selectedNotification, setSelectedNotification] = useState<IAddControlNotificationOptions | null>(null);
    const commandBarRef = useRef<ICommandBar>(null);
    const overridenTheme = useThemeOverride(theme.palette.themePrimary, 'transparent', theme.semanticColors.bodyText)

    useImperativeHandle(ref, () => {
        return {
            remeasureCommandBar: () => {
                commandBarRef.current?.remeasure();
            }
        }
    })

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

    return <div className={`${styles.root}${props.className ? ` ${props.className}` : ''}`}>
        <ThemeProvider theme={overridenTheme} applyTo="none">
            <CommandBar
                overflowItems={notifications.filter(x => x.renderedInOverflow).map(y => getCommandBarItem(y))}
                theme={overridenTheme}
                id={iconId}
                componentRef={commandBarRef}
                items={notifications.filter(x => !x.renderedInOverflow).map(y => getCommandBarItem(y))} />
        </ThemeProvider>
        {selectedNotification &&
            <Callout
                hidden={!selectedNotification}
                className={styles.callout}
                onDismiss={() => setSelectedNotification(null)}
                target={`#${iconId}`}>
                {selectedNotification.title &&
                    <Text title={selectedNotification.title} className={styles.calloutTitle} variant={selectedNotification.messages.length > 0 ? 'xLarge' : undefined}>{selectedNotification.title}</Text>
                }
                <Text>{selectedNotification.messages[0]}</Text>
                {selectedNotification.actions &&
                    renderActions(selectedNotification.actions)
                }
            </Callout>
        }
    </div>
});