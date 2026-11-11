import { DefaultButton, IButtonProps, ILinkProps, ITextProps, Link, PrimaryButton, Text } from "@fluentui/react";

/** The replaceable pieces of a notification card. */
export interface INotificationCardComponents {
    /** The card; its `children` are the title, the message and the actions. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTitle: (props: ITextProps) => JSX.Element | null;
    onRenderMessage: (props: ITextProps) => JSX.Element | null;
    /** The row of actions; its `children` are the buttons or the links. */
    onRenderActions: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** One action while there are two at most; the first is the primary one. */
    onRenderButton: (props: IButtonProps & { isPrimary: boolean }) => JSX.Element | null;
    /** One action once there are more than two. */
    onRenderLink: (props: ILinkProps) => JSX.Element | null;
}

/** The defaults for {@link INotificationCardComponents}. */
export const NotificationCardComponents: INotificationCardComponents = {
    onRender: props => <div {...props} />,
    onRenderTitle: props => <Text {...props} />,
    onRenderMessage: props => <Text {...props} />,
    onRenderActions: props => <div {...props} />,
    onRenderButton: ({ isPrimary, ...props }) => isPrimary ? <PrimaryButton {...props} /> : <DefaultButton {...props} />,
    onRenderLink: props => <Link {...props} />,
};
