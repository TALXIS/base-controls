import { Fragment, useMemo } from "react";
import { Icon } from "@fluentui/react";
import { INotificationCardComponents, NotificationCardComponents } from "./components";
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
    components?: Partial<INotificationCardComponents>;
}

/** A notification read in full: its title, its message and what can be done about it. */
export const NotificationCard = (props: INotificationCardProps) => {
    const { title, message, actions = [] } = props;
    const components = { ...NotificationCardComponents, ...props.components };
    const styles = useMemo(() => getNotificationCardStyles(), []);
    //more than two read better as links than as a row of buttons
    const asLinks = actions.length > 2;

    const renderAction = (action: INotificationCardAction, index: number) => <Fragment key={action.key}>
        {asLinks
            ? components.onRenderLink({
                className: styles.link,
                onClick: action.onClick,
                children: <>{action.iconName && <Icon iconName={action.iconName} />}{action.text}</>,
            })
            : components.onRenderButton({
                isPrimary: index === 0,
                text: action.text,
                iconProps: action.iconName ? { iconName: action.iconName } : undefined,
                onClick: action.onClick,
            })}
    </Fragment>;

    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {title && components.onRenderTitle({ className: styles.title, variant: message ? 'xLarge' : undefined, children: title })}
            {message && components.onRenderMessage({ children: message })}
            {actions.length > 0 && components.onRenderActions({ className: asLinks ? styles.links : styles.buttons, children: actions.map(renderAction) })}
        </>,
    });
};
