import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getNotificationsStyles = (theme: ITheme, isUnfolded: boolean) => {
	return mergeStyleSets({
		notification: {
			flexDirection: 'row',
		},
		groupedNotification: {
			cursor: 'pointer',
		},
		groupedInnerText: {
			fontWeight: 600
		},
		actions: {
			margin: 0
		},
		chevronBtn: {
			backgroundColor: 'transparent !important',
		},
		lastGroupedNotificationItem: {
			borderBottom: `1px solid ${theme.semanticColors.menuDivider}`
		},
		chevronBtnIcon: {
			fontSize: 14,
			transition: 'transform 0.2s ease-in-out',
			transform: isUnfolded ? 'rotate(180deg)' : 'rotate(0deg)',
			color: theme.semanticColors.infoIcon
		}
	});
};
