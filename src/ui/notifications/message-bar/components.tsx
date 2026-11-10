import { IButtonProps, IconButton, IContextualMenuProps, IMessageBarProps, MessageBar } from "@fluentui/react";
import { ContextualMenu } from "../../surfaces";

/** A bar the notification bar draws. */
export interface INotificationMessageBarRenderProps extends IMessageBarProps {
    /** `single` for a lone message, `group` for the bar folding several, `child` for each one listed under it. */
    variant: 'single' | 'group' | 'child';
}

/** The replaceable pieces of a notification bar. */
export interface INotificationMessageBarComponents {
    /** Every bar drawn: the single one, the grouped one and each message listed under it. */
    onRenderMessageBar: (props: INotificationMessageBarRenderProps) => JSX.Element | null;
    /** A message's text, handed over as `dangerouslySetInnerHTML`. */
    onRenderMessage: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The chevron that unfolds the grouped messages. */
    onRenderToggleButton: (props: IButtonProps) => JSX.Element | null;
    /** The unfolded list of grouped messages. */
    onRenderMenu: (props: IContextualMenuProps) => JSX.Element | null;
}

/** The defaults for {@link INotificationMessageBarComponents}. */
export const NotificationMessageBarComponents: INotificationMessageBarComponents = {
    onRenderMessageBar: ({ variant, ...props }) => <MessageBar {...props} />,
    onRenderMessage: props => <div {...props} />,
    onRenderToggleButton: props => <IconButton {...props} />,
    onRenderMenu: props => <ContextualMenu {...props} />,
};
