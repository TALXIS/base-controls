import React, { useMemo } from 'react';
import { IconButton, IMessageBarStyles, MessageBar, MessageBarType, useTheme } from '@fluentui/react';
import { ContextualMenu } from '@ui/surfaces';
import { INotificationMessageBarComponents } from './components';
import { getNotificationMessageBarStyles } from './styles';
import { LocalizationService } from '@utils';
import { INotificationMessageBarLabels, NOTIFICATION_MESSAGE_BAR_LABELS } from './labels';

export interface INotificationMessageBarProps {
	messages?: {
		text: string;
		level: 'ERROR' | 'WARNING' | 'INFO';
	}[],
	components?: Partial<INotificationMessageBarComponents>;
	labels?: Partial<INotificationMessageBarLabels>;
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
	const { labels, messages = [] } = props;
	const [isUnfolded, setIsUnfolded] = React.useState(false);
	const styles = useMemo(() => getNotificationMessageBarStyles(theme, isUnfolded), [theme, isUnfolded]);
	const groupedNotificationRef = React.useRef<HTMLDivElement>(null);
	const localizationService = useMemo(() => new LocalizationService({
		...NOTIFICATION_MESSAGE_BAR_LABELS,
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
