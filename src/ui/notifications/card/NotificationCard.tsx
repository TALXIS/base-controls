import { useMemo } from "react";
import { DefaultButton, Icon, Link, PrimaryButton, Text } from "@fluentui/react";
import { getNotificationCardStyles } from "./styles";

export interface INotificationCardAction {
    key: string;
    text: string;
    iconName?: string;
    onClick: () => void;
}

export interface INotificationCardProps {
    title?: string;
    message?: string;
    actions?: INotificationCardAction[];
}

/** A notification read in full: its title, its message and what can be done about it. */
export const NotificationCard = (props: INotificationCardProps) => {
    const { title, message, actions = [] } = props;
    const styles = useMemo(() => getNotificationCardStyles(), []);
    //more than two read better as links than as a row of buttons
    const asLinks = actions.length > 2;

    const renderAction = (action: INotificationCardAction, index: number) => {
        const iconProps = action.iconName ? { iconName: action.iconName } : undefined;
        if (asLinks) {
            return <Link key={action.key} className={styles.link} onClick={action.onClick}>
                {action.iconName && <Icon iconName={action.iconName} />}
                {action.text}
            </Link>;
        }
        const Button = index === 0 ? PrimaryButton : DefaultButton;
        return <Button key={action.key} text={action.text} iconProps={iconProps} onClick={action.onClick} />;
    };

    return <div className={styles.root}>
        {title && <Text className={styles.title} variant={message ? 'xLarge' : undefined}>{title}</Text>}
        {message && <Text>{message}</Text>}
        {actions.length > 0 && <div className={asLinks ? styles.links : styles.buttons}>{actions.map(renderAction)}</div>}
    </div>;
};
