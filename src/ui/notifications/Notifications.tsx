import React, { useMemo } from 'react';
import { ContextualMenu, IconButton, IMessageBarStyles, MessageBar, MessageBarType, useTheme } from '@fluentui/react';
import { INotificationsComponents } from './components';
import { getNotificationsStyles } from './styles';
import { LocalizationService } from '@utils';
import { INotificationsLabels, NOTIFICATIONS_LABELS } from './labels';

export interface INotificationsProps {
	messages?: {
		text: string;
		level: 'ERROR' | 'WARNING' | 'INFO';
	}[],
	components?: Partial<INotificationsComponents>;
	labels?: Partial<INotificationsLabels>;
}

const getMessageBarType = (messages: INotificationsProps['messages'] = []): MessageBarType => {
	const hasError = messages.some(message => message.level === 'ERROR');
	if (hasError) return MessageBarType.error;
	const hasWarning = messages.some(message => message.level === 'WARNING');
	if (hasWarning) return MessageBarType.warning;
	return MessageBarType.info;
}

export const Notifications = (props: INotificationsProps) => {
	const theme = useTheme();
	const { labels, messages = [] } = props;
	const [isUnfolded, setIsUnfolded] = React.useState(false);
	const styles = useMemo(() => getNotificationsStyles(theme, isUnfolded), [theme, isUnfolded]);
	const groupedNotificationRef = React.useRef<HTMLDivElement>(null);
	const localizationService = useMemo(() => new LocalizationService({
		...NOTIFICATIONS_LABELS,
		...labels,
	}), []);

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
			{localizationService.getLocalizedString("groupedNotificationsSummary", {
				count: messages.length.toString(),
			})}
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
