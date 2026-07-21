import React, { useMemo } from 'react';
import { ContextualMenu, IconButton, IMessageBarStyles, MessageBar, MessageBarType, useTheme } from '@fluentui/react';
import { INotificationsComponents } from './components';
import { getNotificationsStyles } from './styles';

export interface INotificationsProps {
	messages: {
		text: string;
		level: 'ERROR' | 'WARNING' | 'INFO';
	}[],
	components?: Partial<INotificationsComponents>;
}

const getMessageBarType = (messages: INotificationsProps['messages']): MessageBarType => {
	const hasError = messages.some(message => message.level === 'ERROR');
	if (hasError) return MessageBarType.error;
	const hasWarning = messages.some(message => message.level === 'WARNING');
	if (hasWarning) return MessageBarType.warning;
	return MessageBarType.info;
}

export const Notifications = (props: INotificationsProps) => {
	const theme = useTheme();
	const { messages } = props;
	const [isUnfolded, setIsUnfolded] = React.useState(false);
	const styles = useMemo(() => getNotificationsStyles(theme, isUnfolded), [theme, isUnfolded]);
	const groupedNotificationRef = React.useRef<HTMLDivElement>(null);

	const messageBarStyles: IMessageBarStyles = {
		root: styles.notification,
		innerText: styles.innerText,
		actions: styles.actions
	}

	const messageBarType = getMessageBarType(messages);

	if (messages.length === 0) return <></>

	if (messages.length === 1) {
		const message = messages[0];
		return <MessageBar styles={messageBarStyles} messageBarType={messageBarType}>
			{message.text}
		</MessageBar>
	}

	else {
		return <div ref={groupedNotificationRef} className={styles.groupedNotification} onClick={() => setIsUnfolded(!isUnfolded)}>
			<MessageBar
				styles={messageBarStyles}
				messageBarType={messageBarType}
				actions={
					<IconButton styles={{ root: styles.chevronBtn, icon: styles.chevronBtnIcon }} iconProps={{ iconName: 'ChevronDown' }} />
				}
			>
				Máte {messages.length} oznámení. Výběrem je zobrazíte.
			</MessageBar>
			{isUnfolded &&
				<ContextualMenu
					items={messages.map((message, index) => ({
						key: index.toString(),
					}))}
					onRenderContextualMenuItem={(props) => {
						const key = parseInt(props?.key || '0');
						const message = messages[key];
						const isLastItem = key === messages.length - 1;
						
						return <MessageBar className={!isLastItem ? styles.lastGroupedNotificationItem : undefined} styles={messageBarStyles} messageBarType={getMessageBarType([message])}>
							{message.text}
						</MessageBar>
					}}
					useTargetWidth
					target={groupedNotificationRef.current}
					onDismiss={() => setIsUnfolded(!isUnfolded)}
				/>
			}
		</div>
	}
};
