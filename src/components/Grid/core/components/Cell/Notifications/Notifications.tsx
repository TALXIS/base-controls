import { Icon, useTheme, Text, Callout, PrimaryButton, DefaultButton, Link, ICommandBar, ThemeProvider, ICommandBarItemProps } from "@fluentui/react"
import { getNotificationStyles } from "./styles";
import { useEffect, useMemo, useRef, useState } from "react";
import { IAddControlNotificationOptions, IColumn, IControlNotificationAction, ICustomColumnFormatting } from "@talxis/client-libraries";
import { CommandBar, useResizeObserver, useThemeGenerator } from "@talxis/react-components";
import { useGridInstance } from "../../../hooks/useGridInstance";
import { useControlTheme } from "../../../../../../utils";

interface INotifications {
    notifications: IAddControlNotificationOptions[],
    formatting: Required<ICustomColumnFormatting>,
    isActionColumn: boolean;
    columnAlignment: IColumn['alignment'],
    farItems?: ICommandBarItemProps[]
}


export const Notifications = (props: INotifications) => {
    const { notifications, formatting, farItems, isActionColumn, columnAlignment } = { ...props };
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getNotificationStyles(isActionColumn, columnAlignment);
    const iconId = useMemo(() => `icon${crypto.randomUUID()}`, []);
    const [selectedNotification, setSelectedNotification] = useState<IAddControlNotificationOptions | null>(null);
    const commandBarRef = useRef<ICommandBar>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const observe = useResizeObserver(() => {
        commandBarRef.current?.remeasure();
    })
    const overridenTheme = useThemeGenerator(theme.semanticColors.bodyText, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText, formatting.themeOverride);

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
            return <div className={styles.calloutButtons}>
                {actions.map((action, i) => renderActionButton(action, i === 0 ? 'primary' : 'default'))}
            </div>
        }
        return <CommandBar items={actions.map((action, i) => {
            return {
                key: i.toString(),
                text: action.message,
                commandBarButtonAs: () => <Link onClick={() => action.actions.map(callback => callback())} className={styles.calloutLink}>
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


    const getCommandBarItems = (): { items: ICommandBarItemProps[], overflowItems: ICommandBarItemProps[] } => {
        const items: ICommandBarItemProps[] = [];
        const overflowItems: ICommandBarItemProps[] = [];

        notifications.map(notification => {
            const item: ICommandBarItemProps = {
                key: notification.uniqueId,
                text: notification.text,
                tooltipHostProps: {
                    ...notification.buttonProps?.tooltipHostProps,
                    calloutProps: {
                        theme: contextualMenuTheme
                    },
                    tooltipProps: {
                        theme: contextualMenuTheme
                    },
                },
                iconProps: notification.iconName ? {
                    iconName: notification.iconName,
                    ...notification.buttonProps?.iconProps
                } : undefined,
                ...notification.buttonProps,
                onClick: (e) => {
                    notification.buttonProps?.onClick?.(e);
                    onNotificationClick(notification);
                }
            }
            if (notification.buttonProps?.renderedInOverflow) {
                overflowItems.push(item);
            }
            else {
                items.push(item);
            }
        })
        return {
            items: items,
            overflowItems: overflowItems
        }
    }

    const contextualMenuTheme = useControlTheme(grid.pcfContext.fluentDesignLanguage);
    const { items, overflowItems } = getCommandBarItems();

    useEffect(() => {
        if (isActionColumn) {
            observe(containerRef.current!);
        }
    }, [isActionColumn]);


    return <div ref={containerRef} className={styles.notificationsRoot}>
        <ThemeProvider theme={overridenTheme}>
            <CommandBar
                contextualMenuTheme={contextualMenuTheme}
                id={iconId}
                componentRef={commandBarRef}
                styles={{
                    primarySet: styles.notificationsPrimarySet
                }}
                items={items}
                overflowItems={overflowItems}
                farItems={farItems} />
        </ThemeProvider>
        {selectedNotification &&
            <Callout
                theme={contextualMenuTheme}
                hidden={!selectedNotification}
                className={styles.callout}
                onDismiss={() => setSelectedNotification(null)}
                target={`#${iconId}`}>
                <ThemeProvider className={styles.calloutContent} theme={contextualMenuTheme}>
                    {selectedNotification.text &&
                        <Text title={selectedNotification.text} className={styles.calloutTitle} variant={selectedNotification.messages.length > 0 ? 'xLarge' : undefined}>{selectedNotification.text}</Text>
                    }
                    <Text>{selectedNotification.messages[0]}</Text>
                    {selectedNotification.actions &&
                        renderActions(selectedNotification.actions)
                    }
                </ThemeProvider>
            </Callout>
        }
    </div>
}