import { useFormContext } from '../root/context';
import { IRecord } from '@talxis/client-libraries';
import { INotificationsProps, Notifications as NotificationsBase } from '../../../../Notifications';
import { useValidationSummary } from '../root';
import { IValidation } from '../../../Form';

const getValidationNotifications = (record: IRecord, validationSummary: IValidation[]) => {
	return validationSummary.map(validation => {
		const column = record.getField(validation.fieldName).getColumn();
		const displayName = column.displayName ?? column.name;
		const message = `<strong>${displayName}</strong>: ${validation.errorMessage}`;
		return {
			text: message,
			level: validation.error ? 'ERROR' as const : 'WARNING' as const
		}
	});
}

export const Notifications = (props: INotificationsProps) => {
	const form = useFormContext();
	const record = form.getRecord();
	const { messages = [] } = props;
	const validationSummary = useValidationSummary();
	const validationNotifications = getValidationNotifications(record, validationSummary);


	return <NotificationsBase {...props} messages={[...messages, ...validationNotifications ?? []]} />;
};
