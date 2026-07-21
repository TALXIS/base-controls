import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getSkeletonStyles = (theme: ITheme) => {
	return mergeStyleSets({
		root: {
			display: 'flex',
			flexDirection: 'column',
			gap: 16,
			padding: 12,
		},
		notifications: {
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
		},
		notification: {
			borderRadius: 2,
			overflow: 'hidden',
		},
		ribbon: {
			paddingBottom: 8,
			borderBottom: `1px solid ${theme.palette.neutralLight}`,
		},
		body: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
			gap: 16,
		},
		section: {
			display: 'flex',
			flexDirection: 'column',
			gap: 12,
			padding: 16,
			border: `1px solid ${theme.palette.neutralLight}`,
			borderRadius: 2,
			backgroundColor: theme.palette.white,
		},
		sectionHeader: {
			paddingBottom: 8,
			borderBottom: `1px solid ${theme.palette.neutralLighter}`,
		},
		sectionContent: {
			display: 'grid',
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			columnGap: 16,
			rowGap: 12,
		},
		field: {
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
			minWidth: 0,
		},
		fieldLabel: {
			maxWidth: '100%',
		},
		fieldControl: {
			maxWidth: '100%',
		},
	});
};
