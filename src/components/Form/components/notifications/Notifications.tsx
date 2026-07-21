import React, { useMemo } from 'react';
import { ContextualMenu, IconButton, IMessageBarStyles, MessageBar, MessageBarType, useTheme } from '@fluentui/react';
import { INotificationsComponents } from './components';
import { getNotificationsStyles } from './styles';
import { useFormContext } from '../form/context';
import { useEventEmitter } from '../../../../hooks';
import { IRecordEvents, IRecordSaveOperationResult } from '@talxis/client-libraries';

export interface INotificationsProps {
	messages?: {
		text: string;
		level: 'ERROR' | 'WARNING' | 'INFO';
	}[],
	components?: Partial<INotificationsComponents>;
}

const getMessageBarType = (messages: INotificationsProps['messages'] = []): MessageBarType => {
	const hasError = messages.some(message => message.level === 'ERROR');
	if (hasError) return MessageBarType.error;
	const hasWarning = messages.some(message => message.level === 'WARNING');
	if (hasWarning) return MessageBarType.warning;
	return MessageBarType.info;
}


//TODO: make it a self contained component
export const InternalNotifications = (props: INotificationsProps) => {
	const theme = useTheme();
	const { messages = [] } = props;
	const [isUnfolded, setIsUnfolded] = React.useState(false);
	const styles = useMemo(() => getNotificationsStyles(theme, isUnfolded), [theme, isUnfolded]);
	const groupedNotificationRef = React.useRef<HTMLDivElement>(null);

	const messageBarStyles: IMessageBarStyles = {
		root: styles.notification,
		actions: styles.actions
	}

	const messageBarType = getMessageBarType(messages);

	if (messages.length === 0) return <></>

	if (messages.length === 1) {
		const message = messages[0];
		return <MessageBar styles={messageBarStyles} messageBarType={messageBarType}>
			<div dangerouslySetInnerHTML={{ __html: message.text }} />
		</MessageBar>
	}

	else {
		return <div ref={groupedNotificationRef} className={styles.groupedNotification} onClick={() => setIsUnfolded(!isUnfolded)}>
			<MessageBar
				styles={{...messageBarStyles, innerText: styles.groupedInnerText}}
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

						return <MessageBar 
							className={!isLastItem ? styles.lastGroupedNotificationItem : undefined} 
							styles={messageBarStyles} messageBarType={getMessageBarType([message])}>
							<div dangerouslySetInnerHTML={{ __html: message.text }} />
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

export const Notifications = (props: INotificationsProps) => {
	const form = useFormContext();
	const record = form.getRecord();
	const {messages = []} = props;
	const [validationNotifications, setValidationNotifications] = React.useState<INotificationsProps['messages']>([]);

	useEventEmitter<IRecordEvents>(record, 'onAfterSaved', (result: IRecordSaveOperationResult) => {
		const errors = result.errors ?? [];
		const notifications = errors.map(error => {
			const column = record.getField(error.fieldName!).getColumn();
			const displayName = column.displayName ?? column.name;
			const message = `<strong>${displayName}</strong>: ${error.message}`;
			return {
				text: message,
				level: 'ERROR' as const
			}
		})
		setValidationNotifications(notifications);
	});
	return <InternalNotifications {...props} messages={[...messages, ...validationNotifications ?? []]} />
}
