import React from 'react';
import { useFormContext } from '../form/context';
import { useEventEmitter } from '../../../../hooks';
import { IRecord, IRecordSaveOperationResult } from '@talxis/client-libraries';
import { INotificationsProps, Notifications as NotificationsBase } from '../../../Notifications';

const onAfterSaved = (record: IRecord, result: IRecordSaveOperationResult) => {
	const errors = result.errors ?? [];
	const notifications = errors.map(error => {
		const column = record.getField(error.fieldName!).getColumn();
		const displayName = column.displayName ?? column.name;
		const message = `<strong>${displayName}</strong>: ${error.message}`;
		return {
			text: message,
			level: 'ERROR' as const
		}
	});
	return notifications;
}

export const Notifications = (props: INotificationsProps) => {
	const form = useFormContext();
	const record = form.getRecord();
	const { messages = [] } = props;
	const [globalErrorNotifications, setGlobalErrorNotifications] = React.useState<INotificationsProps['messages']>([]);
	const [validationNotifications, setValidationNotifications] = React.useState<INotificationsProps['messages']>([]);


	useEventEmitter(form.events, 'onAfterSave', (result: IRecordSaveOperationResult) => {
		setValidationNotifications(onAfterSaved(record, result));
		setGlobalErrorNotifications([]);
	});
	useEventEmitter(form.events, 'onError', (error, message) => {
		setGlobalErrorNotifications([{ text: message, level: 'ERROR' as const }]);
	});

	return <NotificationsBase {...props} messages={[...messages, ...validationNotifications ?? [], ...globalErrorNotifications ?? []]} />;
};
