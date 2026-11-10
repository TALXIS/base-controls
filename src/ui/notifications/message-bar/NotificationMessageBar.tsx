import { useTheme } from '@theme';
import React, { useEffect, useMemo } from 'react';
import { IMessageBarProps, IMessageBarStyles, MessageBarType } from '@fluentui/react';
import { INotificationMessageBarComponents, NotificationMessageBarComponents } from "./components";
import { getNotificationMessageBarStyles } from './styles';
import { useLabels } from '@labels';
import { NOTIFICATION_MESSAGE_BAR_LABELS } from './labels';

/** One message of a notification bar. */
export interface INotificationMessage {
	/** What the message says. */
	text: string;
	/** How the message is drawn; the most severe one sets the bar's type. */
	level: 'ERROR' | 'WARNING' | 'INFO';
	/** Shows a close button on the message that calls it. */
	onDismiss?: () => void;
}

export interface INotificationMessageBarProps {
	/** The messages to show; the bar is not drawn without any. */
	messages?: INotificationMessage[],
	components?: Partial<INotificationMessageBarComponents>;
}

const getMessageBarType = (messages: INotificationMessageBarProps['messages'] = []): MessageBarType => {
	const hasError = messages.some(message => message.level === 'ERROR');
	if (hasError) return MessageBarType.error;
	const hasWarning = messages.some(message => message.level === 'WARNING');
	if (hasWarning) return MessageBarType.warning;
	return MessageBarType.info;
}

export const NotificationMessageBar = (props: INotificationMessageBarProps) => {
	const theme = useTheme();
	const { messages = [] } = props;
	const components = { ...NotificationMessageBarComponents, ...props.components };
	const [isUnfolded, setIsUnfolded] = React.useState(false);
	const styles = useMemo(() => getNotificationMessageBarStyles(theme, isUnfolded), [theme, isUnfolded]);
	const groupedNotificationRef = React.useRef<HTMLDivElement>(null);
	const labels = useLabels(NOTIFICATION_MESSAGE_BAR_LABELS);
	const isGrouped = messages.length > 1;

	//a list left unfolded would open on its own the next time the bar groups
	useEffect(() => {
		if (!isGrouped) {
			setIsUnfolded(false);
		}
	}, [isGrouped]);

	const messageBarStyles: IMessageBarStyles = {
		root: styles.notification,
		actions: styles.actions
	};

	const messageBarType = getMessageBarType(messages);

	if (messages.length === 0) return <></>;

	const renderMessage = (message: INotificationMessage) => components.onRenderMessage({ dangerouslySetInnerHTML: { __html: message.text } });

	//the click would also reach the grouped bar, which folds the list on a click
	const getDismissProps = (message: INotificationMessage): Pick<IMessageBarProps, 'onDismiss'> => {
		const { onDismiss } = message;
		if (!onDismiss) {
			return {};
		}
		return {
			onDismiss: event => {
				event?.stopPropagation();
				onDismiss();
			},
		};
	};

	if (messages.length === 1) {
		return components.onRenderMessageBar({ variant: 'single', styles: messageBarStyles, messageBarType, ...getDismissProps(messages[0]), children: renderMessage(messages[0]) });
	}

	return <div ref={groupedNotificationRef} className={styles.groupedNotification} onClick={() => setIsUnfolded(!isUnfolded)}>
		{components.onRenderMessageBar({
			variant: 'group',
			styles: { ...messageBarStyles, innerText: styles.groupedInnerText },
			messageBarType,
			actions: components.onRenderToggleButton({ styles: { root: styles.chevronBtn, icon: styles.chevronBtnIcon }, iconProps: { iconName: 'ChevronDown' } }) ?? undefined,
			children: labels.get('notificationMessageBar.groupedNotificationsSummary', { count: messages.length }),
		})}
		{isUnfolded && components.onRenderMenu({
			items: messages.map((message, index) => ({ key: index.toString() })),
			onRenderContextualMenuItem: menuItemProps => {
				const index = parseInt(menuItemProps?.key || '0');
				const message = messages[index];
				return components.onRenderMessageBar({
					variant: 'child',
					className: index < messages.length - 1 ? styles.lastGroupedNotificationItem : undefined,
					styles: messageBarStyles,
					messageBarType: getMessageBarType([message]),
					...getDismissProps(message),
					children: renderMessage(message),
				});
			},
			useTargetWidth: true,
			target: groupedNotificationRef,
			onDismiss: () => setIsUnfolded(false),
		})}
	</div>;
};
