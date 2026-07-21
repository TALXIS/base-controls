import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getSkeletonStyles = (theme: ITheme) => {
	return mergeStyleSets({
		root: {
			display: 'flex',
			flexDirection: 'column',
			gap: 12,
			padding: 12,
			containerType: 'inline-size',
		},
		tabs: {
			display: 'flex',
			alignItems: 'center',
			gap: 18,
			padding: '4px 8px 6px',
		},
		tabMarker: {
			height: 12,
			overflow: 'hidden',
			borderRadius: 1,
			flexShrink: 0,
		},
		notifications: {
			display: 'flex',
			padding: '0 8px',
		},
		notification: {
			borderRadius: 2,
			overflow: 'hidden',
		},
		ribbon: {
			padding: '0 8px',
		},
		body: {
			display: 'grid',
			gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
			gap: 12,
			'@container (min-width: 768px)': {
				gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			},
			'@container (min-width: 1200px)': {
				gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
			},
		},
		section: {
			display: 'flex',
			flexDirection: 'column',
			border: `1px solid ${theme.semanticColors.bodyDivider}`,
			borderRadius: 8,
			backgroundColor: theme.semanticColors.bodyBackground,
			overflow: 'hidden',
			boxShadow: theme.effects.elevation4,
		},
		sectionHeader: {
			display: 'flex',
			alignItems: 'center',
			padding: '8px 12px',
			backgroundColor: theme.palette.neutralLighterAlt,
			borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
		},
		sectionContent: {
			padding: 12,
			display: 'grid',
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			columnGap: 10,
			rowGap: 10,
		},
		field: {
			display: 'grid',
			gridTemplateColumns: '115px minmax(0, 1fr)',
			gap: 8,
			alignItems: 'start',
			minWidth: 0,
		},
		fieldLabel: {
			width: '100%',
		},
		fieldControl: {
			width: '100%',
		},
	});
};
