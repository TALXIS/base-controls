import React, { useMemo } from 'react';
import { IconButton, IMessageBarStyles, MessageBar, MessageBarType, useTheme } from '@fluentui/react';
import { ContextualMenu } from '@ui/surfaces';
import { INotificationMessageBarComponents } from './components';
import { getNotificationMessageBarStyles } from './styles';
import { useLabels } from '@utils/localization';
import { NOTIFICATION_MESSAGE_BAR_LABELS } from './labels';

/** One message of a notification bar. */
export interface INotificationMessage {
	/** What the message says. */
	text: string;
	/** How the message is drawn; the most severe one sets the bar's type. */
	level: 'ERROR' | 'WARNING' | 'INFO';
}

export interface INotificationMessageBarProps {
	/** The messages to show; the bar is not drawn without any. */
	messages?: INotificationMessage[],
	components?: Partial<INotificationMessageBarComponents>;
	/** Replaces the summary shown over several messages. */
	groupedNotificationsSummary?: string;
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
	const [isUnfolded, setIsUnfolded] = React.useState(false);
	const styles = useMemo(() => getNotificationMessageBarStyles(theme, isUnfolded), [theme, isUnfolded]);
	const groupedNotificationRef = React.useRef<HTMLDivElement>(null);
	const labels = useLabels(NOTIFICATION_MESSAGE_BAR_LABELS);

	const messageBarStyles: IMessageBarStyles = {
		root: styles.notification,
		actions: styles.actions
	};

	const messageBarType = getMessageBarType(messages);

	if (messages.length === 0) return <></>;

	if (messages.length === 1) {
		const message = messages[0];
		return <MessageBar styles={messageBarStyles} messageBarType={messageBarType}>
			<div dangerouslySetInnerHTML={{ __html: message.text }} />
		</MessageBar>;
	}

	return <div ref={groupedNotificationRef} className={styles.groupedNotification} onClick={() => setIsUnfolded(!isUnfolded)}>
		<MessageBar
			styles={{ ...messageBarStyles, innerText: styles.groupedInnerText }}
			messageBarType={messageBarType}
			actions={
				<IconButton styles={{ root: styles.chevronBtn, icon: styles.chevronBtnIcon }} iconProps={{ iconName: 'ChevronDown' }} />
			}
		>
			{props.groupedNotificationsSummary ?? labels.get('notificationMessageBar.groupedNotificationsSummary', { count: messages.length })}
		</MessageBar>
		{isUnfolded &&
			<ContextualMenu
				items={messages.map((message, index) => ({
					key: index.toString(),
				}))}
				onRenderContextualMenuItem={(menuItemProps) => {
					const key = parseInt(menuItemProps?.key || '0');
					const message = messages[key];
					const isLastItem = key === messages.length - 1;

					return <MessageBar
						className={!isLastItem ? styles.lastGroupedNotificationItem : undefined}
						styles={messageBarStyles}
						messageBarType={getMessageBarType([message])}
					>
						<div dangerouslySetInnerHTML={{ __html: message.text }} />
					</MessageBar>;
				}}
				useTargetWidth
				target={groupedNotificationRef.current}
				onDismiss={() => setIsUnfolded(!isUnfolded)}
			/>
		}
	</div>;
};
