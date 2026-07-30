import { useForm, useLocalizationService } from '../root/context';
import { INotificationsProps, Notifications as NotificationsBase } from '@components/Notifications';
import { useValidationSummary } from '../root';

export interface IFormNotificationsProps extends Omit<INotificationsProps, 'labels'> {}

export const Notifications = (props: IFormNotificationsProps) => {
	const form = useForm();
	const localizationService = useLocalizationService();
	const record = form.getRecord();
	const { messages = [] } = props;
	const validationSummary = useValidationSummary();

	const getValidationNotifications = () => {
		return validationSummary.map((validation) => {
			if (!validation.fieldName) {
				return {
					text: validation.errorMessage ?? '',
					level: validation.error ? 'ERROR' as const : 'WARNING' as const,
				};
			}

			const column = record.getField(validation.fieldName).getColumn();
			const displayName = column.displayName ?? column.name;

			return {
				text: `<strong>${displayName}</strong>: ${validation.errorMessage}`,
				level: validation.error ? 'ERROR' as const : 'WARNING' as const,
			};
		});
	};

	const validationNotifications = getValidationNotifications();

	const mergedMessages = [...messages, ...validationNotifications ?? []];

	return <NotificationsBase {...props} labels={{
		groupedNotificationsSummary: localizationService.getLocalizedString('groupedNotificationsSummary')
	}} messages={mergedMessages} />;
};
