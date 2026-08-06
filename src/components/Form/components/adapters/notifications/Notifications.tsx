import { useForm, useLocalizationService } from '../root/context';
import { INotificationsProps } from '@components/Notifications';
import { useValidationSummary } from '../root';
import { FormNotificationsComponents, IFormNotificationsComponents } from './components';

export interface IFormNotificationsProps extends Omit<INotificationsProps, 'labels'> {
	components?: Partial<IFormNotificationsComponents>;
}

export const Notifications = (props: IFormNotificationsProps) => {
	const form = useForm();
	const localizationService = useLocalizationService();
	const record = form.getRecord();
	const { messages = [], components: componentsProp, ...notificationsProps } = props;
	const validationSummary = useValidationSummary();
	const components = { ...FormNotificationsComponents, ...componentsProp };

	const getValidationNotifications = () => {
		return validationSummary.map((validation) => {
			if (!validation.fieldName) {
				return {
					text: validation.errorMessage ?? '',
					level: validation.error ? 'ERROR' as const : 'WARNING' as const,
				};
			}

			const field = record.getFields().find((field) => field.getColumn().name === validation.fieldName);
			const displayName = field?.getColumn().displayName ?? validation.fieldName;

			return {
				text: `<strong>${displayName}</strong>: ${validation.errorMessage}`,
				level: validation.error ? 'ERROR' as const : 'WARNING' as const,
			};
		});
	};

	const validationNotifications = getValidationNotifications();

	const mergedMessages = [...messages, ...validationNotifications ?? []];

	return components.onRenderNotifications({
		...notificationsProps,
		labels: {
			groupedNotificationsSummary: localizationService.getLocalizedString('groupedNotificationsSummary')
		},
		messages: mergedMessages,
	});
};
